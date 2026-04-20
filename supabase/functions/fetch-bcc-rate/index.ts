import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Fetching BCC exchange rate from bcc.cd...');

    const response = await fetch('https://www.bcc.cd/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PilotFlow/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
    });

    if (!response.ok) {
      console.error('BCC website returned status:', response.status);
      return new Response(
        JSON.stringify({ error: `Le site BCC a retourné une erreur (${response.status})` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    console.log('HTML fetched, length:', html.length);

    // Parse the USD/CDF rate from the BCC page
    // Pattern: "1 USD**= X XXX,XXXX**CDF" or similar variations
    let taux: number | null = null;
    let dateStr: string | null = null;

    // Try multiple regex patterns to find the USD rate
    // Pattern 1: "1 USD**= 2 855,0873**CDF" (with ** markdown-like)
    // Pattern 2: Direct number after USD= or USD =
    const patterns = [
      /1\s*USD[*\s]*=\s*([\d\s]+[,.][\d]+)\s*\**\s*CDF/i,
      /USD[*\s]*=\s*([\d\s]+[,.][\d]+)\s*\**\s*CDF/i,
      /USD\s*<[^>]*>\s*([\d\s.,]+)\s*<[^>]*>\s*CDF/i,
      /class="[^"]*">\s*([\d\s]+[,.][\d]+)\s*CDF/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        // Clean up the number: remove spaces, replace comma with dot
        const cleanedNumber = match[1].replace(/\s/g, '').replace(',', '.');
        const parsed = parseFloat(cleanedNumber);
        if (parsed > 100 && parsed < 100000) {
          taux = parsed;
          console.log('Found rate with pattern:', pattern.source, '-> value:', taux);
          break;
        }
      }
    }

    // Additional fallback: look for the rate in structured data
    if (!taux) {
      // Try to find pattern like ">2 855,0873<" near "USD" and "CDF"
      const fallbackMatch = html.match(/USD[\s\S]{0,200}?([\d]\s*[\d]{3}[,.][\d]{2,4})[\s\S]{0,50}?CDF/i);
      if (fallbackMatch) {
        const cleaned = fallbackMatch[1].replace(/\s/g, '').replace(',', '.');
        const parsed = parseFloat(cleaned);
        if (parsed > 100 && parsed < 100000) {
          taux = parsed;
          console.log('Found rate with fallback pattern:', taux);
        }
      }
    }

    // Try to extract the date
    const dateMatch = html.match(/Date:\s*(\d{1,2}\/\d{2}\/\d{4})/i);
    if (dateMatch) {
      dateStr = dateMatch[1];
      console.log('Found date:', dateStr);
    }

    if (!taux) {
      console.error('Could not parse rate from HTML');
      // Log a snippet of the HTML around "USD" for debugging
      const usdIdx = html.indexOf('USD');
      if (usdIdx > -1) {
        console.log('HTML around USD:', html.substring(Math.max(0, usdIdx - 50), usdIdx + 200));
      }
      return new Response(
        JSON.stringify({
          error: 'Impossible de lire le taux depuis le site BCC. Le format de la page a peut-être changé.',
          hint: 'Veuillez saisir le taux manuellement depuis bcc.cd',
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = {
      taux,
      date: dateStr || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      source: 'BCC (Banque Centrale du Congo) — cours indicatif',
      fetchedAt: new Date().toISOString(),
    };

    console.log('Returning rate:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching BCC rate:', error);
    return new Response(
      JSON.stringify({
        error: `Erreur de connexion au site BCC: ${error.message}`,
        hint: 'Vérifiez votre connexion ou saisissez le taux manuellement',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
