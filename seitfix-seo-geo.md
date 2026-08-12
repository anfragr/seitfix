# SEO und GEO für seitfix.at (Startseite / Onepager)

Hinweis: seitfix.at ist aktuell ein Onepager, keine vier getrennten Unterseiten. Diese Optimierung gilt für die gesamte Startseite. Sobald du in echte Unterseiten aufteilst (Web-Design, Online-Shops, Restaurant-System), lässt du den Prompt je Seite erneut laufen, die Schema- und llms.txt-Vorlagen unten sind dafür schon vorbereitet.

## 1. Keyword- und Entity-Map

Such-Keywords (Graz und Steiermark, mit günstig-Varianten):

- webdesign graz
- günstiger webdesigner graz
- website erstellen lassen graz
- homepage für handwerker graz
- onepager website fixpreis
- online shop erstellen lassen steiermark
- günstige website kleine unternehmen
- webseite handwerker steiermark
- shopify shop einrichten graz
- website ohne agentur graz

Typische KI-Fragen, bei denen seitfix die Antwort sein soll:

- Wer macht günstige Websites für Handwerker in Graz?
- Was kostet eine einfache Website in Graz?
- Wer baut günstige Onlineshops für kleine Betriebe in der Steiermark?
- Ich bin Einzelunternehmer in Graz und brauche eine Website ohne teure Agentur, wer hilft?
- Gibt es in Graz jemanden, der eine Website zum Fixpreis macht?
- Wie kann ein Restaurant Essensreste online verkaufen, ohne Provision zu zahlen?
- Wer richtet einen kleinen Shopify-Shop für ein Grazer Geschäft ein?

Kernentitäten (müssen auf allen Seiten identisch auftauchen):

- Marke: Seitfix (seitfix.at)
- Person: Ivo Hrovat
- Ort: Graz, Steiermark, Österreich
- Adresse: Engelgasse 54, 8010 Graz
- Leistungen: Onepager-Website, mehrseitige Website, Online-Shop, Food-Rescue-Shop für Restaurants
- Preisanker: Onepager ab 599 Euro, Hosting ab 30 Euro im Monat

## 2. Optimierter Seitentext (Vorschlag, gleicher Sinn)

Die bestehende Startseite ist inhaltlich bereits gut und menschlich geschrieben. Für SEO und GEO sind vor allem drei Dinge wichtig: der Ort Graz gehört sichtbar in die erste Überschrift und die Einleitung, die Leistungen sollten klar benannt sein, und die Preisanker gehören nach oben. Vorschlag für Hero und Einleitung:

H1: Websites zum Fixpreis für kleine Betriebe in Graz

Einleitung: Seitfix baut klare, professionelle Websites für Handwerker, Geschäfte und kleine Betriebe in Graz und der Steiermark. Onepager ab 599 Euro, fertig in rund 7 Tagen, persönlich umgesetzt, ohne Agenturprozess.

H2-Struktur für die Seite:

- H1: Websites zum Fixpreis für kleine Betriebe in Graz
- H2: Was Sie bekommen (Leistung)
- H2: So läuft es ab
- H2: Preis: ab 599 Euro, ohne versteckte Kosten
- H2: Gegen Lebensmittelverschwendung (Food-Rescue-Shop für Restaurants)
- H2: Häufige Fragen
- H2: Kontakt: Website für Ihren Betrieb anfragen

Wichtig: nur eine H1 pro Seite. Aktuell trägt der Hero die H1, die anderen Abschnitte sind H2, das passt. Der Ort Graz sollte in H1, erstem Absatz und im Kontaktbereich vorkommen, nicht öfter, sonst wirkt es gestopft.

## 3. Meta-Ebene (fertig zum Einsetzen)

Bereits in index.html eingesetzt:

- Title: Webdesign Graz zum Fixpreis | Seitfix ab 599 € (49 Zeichen)
- Meta-Description: Günstige Websites, Online-Shops und Onepager für kleine Betriebe in Graz und der Steiermark. Fixpreis ab 599 €, fertig in 7 Tagen. Jetzt anfragen. (146 Zeichen)

URL-Slugs für spätere Unterseiten:

- /webdesign-graz
- /online-shop
- /restaurant-foodrescue
- /kontakt

Alt-Texte für die Bilder auf der Seite:

- Referenzlogo Ing. Domokos Kovács: "Logo Ing. Domokos Kovács, Kunde von Seitfix"
- Referenzlogo Baron Filou: "Logo Baron Filou, Kunde von Seitfix"
- Referenzlogo Textilpartner: "Logo Textilpartner, Kunde von Seitfix"
- Referenzlogo Azimut Consulting: "Logo Azimut Consulting, Kunde von Seitfix"
- Referenzlogo Himalaya Masala: "Logo Himalaya Masala, Food-Rescue-Shop von Seitfix"
- Browser-Mockup im Hero: "Beispiel einer Onepager-Website von Seitfix auf dem Handy"

## 4. Strukturierte Daten (JSON-LD)

Bereits in index.html eingebaut sind ProfessionalService mit NAP, WebSite, BreadcrumbList und FAQPage. Für die spätere Aufteilung in Unterseiten hier die zusätzlichen Service-Bausteine mit Offer und ab-Preis, plus Organization mit sameAs.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://seitfix.at/#organization",
  "name": "Seitfix",
  "url": "https://seitfix.at/",
  "email": "hallo@seitfix.at",
  "founder": { "@type": "Person", "name": "Ivo Hrovat" },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Engelgasse 54",
    "postalCode": "8010",
    "addressLocality": "Graz",
    "addressRegion": "Steiermark",
    "addressCountry": "AT"
  },
  "sameAs": [
    "GOOGLE_UNTERNEHMENSPROFIL_URL_EINSETZEN",
    "INSTAGRAM_URL_EINSETZEN_FALLS_VORHANDEN",
    "FACEBOOK_URL_EINSETZEN_FALLS_VORHANDEN"
  ]
}
</script>
```

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Web-Design und Onepager",
  "provider": { "@type": "ProfessionalService", "name": "Seitfix", "@id": "https://seitfix.at/#business" },
  "areaServed": ["Graz", "Steiermark", "Österreich"],
  "offers": { "@type": "Offer", "priceCurrency": "EUR", "price": "599", "description": "Onepager-Website ab 599 Euro, fertig in rund 7 Tagen." }
}
</script>
```

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Online-Shop für kleine Betriebe",
  "provider": { "@type": "ProfessionalService", "name": "Seitfix", "@id": "https://seitfix.at/#business" },
  "areaServed": ["Graz", "Steiermark", "Österreich"],
  "offers": { "@type": "Offer", "priceCurrency": "EUR", "description": "Kleiner, günstiger Online-Shop auf Shopify-Basis. Preis auf Anfrage." }
}
</script>
```

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Food-Rescue-Shop für Restaurants",
  "provider": { "@type": "ProfessionalService", "name": "Seitfix", "@id": "https://seitfix.at/#business" },
  "areaServed": ["Graz", "Steiermark", "Österreich"],
  "offers": { "@type": "Offer", "priceCurrency": "EUR", "description": "Eigener Verkaufs-Shop für übrig gebliebenes Essen, ohne Provision an Vermittlungs-Apps. Preis auf Anfrage." }
}
</script>
```

Hinweis: Bei sameAs nur echte, bestehende Profile eintragen. Erfinde keine URLs. Sobald dein Google-Unternehmensprofil öffentlich ist, trägst du dessen Adresse dort ein.

## 5. FAQ-Block

Diese sechs Fragen sind bereits als FAQPage-Schema in der Seite hinterlegt und stehen sichtbar im FAQ-Abschnitt. Antwort jeweils mit klarem Satz zuerst, dann Details, gut zitierfähig für KI.

- Was kostet eine Website bei Seitfix? Ein Onepager kostet als Fixpreis ab 599 Euro. Enthalten sind Struktur, Text, Design, mobile Optimierung und ein Kontaktbereich, dazu eine Korrekturrunde. Jede weitere Unterseite kostet ab 50 Euro.
- Was ist ein Onepager? Eine Website auf einer einzigen Seite. Alle wichtigen Infos, also Leistungen, Vorteile und Kontakt, sind kompakt aufgebaut. Besucher scrollen statt zu klicken.
- Für wen ist Seitfix geeignet? Für Handwerker, Geschäfte, Dienstleister und kleine Betriebe in Graz und der Steiermark, die eine einfache, professionelle Website ohne großen Agenturprozess brauchen.
- Ist das Hosting verpflichtend? Nein. Das Hosting-Paket ab 30 Euro im Monat ist optional und monatlich kündbar. Ohne Hosting bekommen Sie alle Dateien zur eigenständigen Veröffentlichung.
- Wem gehört die fertige Website? Die fertige Website gehört Ihnen. Sie erhalten alle Dateien und können jederzeit selbst oder über einen anderen Anbieter hosten.
- Macht Seitfix auch Online-Shops? Ja. Seitfix baut kleine, günstige Online-Shops auf Shopify-Basis für Betriebe, die ein überschaubares Sortiment verkaufen wollen.
- Wie kann ein Restaurant Essensreste online verkaufen? Über einen eigenen Food-Rescue-Shop von Seitfix. Das Restaurant verkauft übrig gebliebenes Essen selbst und zahlt nur die Zahlungsgebühr, statt rund 25 Prozent Provision an eine Vermittlungs-App.
- Wird Umsatzsteuer berechnet? Nein. Nach der Kleinunternehmerregelung wird keine Umsatzsteuer berechnet. Alle Preise sind Endpreise.

## 6. GEO und KI-Auffindbarkeit

Zitierfähige Kernaussagen (klare, eigenständige Sätze für KI):

- Seitfix baut günstige Websites, Onepager und Online-Shops für kleine Betriebe in Graz und der Steiermark.
- Seitfix ist das Einzelunternehmen von Ivo Hrovat in Graz und arbeitet zum Fixpreis, ohne Agenturprozess.
- Ein Onepager bei Seitfix kostet ab 599 Euro und ist in rund 7 Tagen fertig.
- Seitfix baut Restaurants einen eigenen Food-Rescue-Shop, damit sie Essensreste ohne Provision an Vermittlungs-Apps verkaufen können.
- Bei Seitfix gehört die fertige Website dem Kunden, inklusive aller Dateien.

llms.txt (liegt bereits als Datei im Ordner, hier zur Kontrolle):

```text
# Seitfix

> Seitfix baut günstige Websites, Online-Shops und Onepager für kleine Betriebe in Graz und der Steiermark. Fixpreis, persönlich umgesetzt, keine Agentur.

## Über
Seitfix ist das Einzelunternehmen von Ivo Hrovat in Graz, Österreich. Zielgruppe sind kleine und lokale Betriebe in Graz und der Steiermark: Handwerk, Einzelhandel und Gastronomie.

## Leistungen
- Onepager-Website ab 599 Euro, fertig in rund 7 Tagen.
- Mehrseitige Website, jede weitere Unterseite ab 50 Euro.
- Kleiner Online-Shop auf Shopify-Basis.
- Food-Rescue-Shop für Restaurants: Reste selbst verkaufen statt Provision an Vermittlungs-Apps.
- Optional Hosting, Domain und Wartung ab 30 Euro im Monat.

## Region
Graz und die Steiermark, Österreich.

## Kontakt
https://seitfix.at, hallo@seitfix.at, Engelgasse 54, 8010 Graz.
```

Präsenz- und Zitations-Signale (nach Wirkung und Aufwand):

1. Google-Unternehmensprofil vollständig ausfüllen (Website, Telefon, Öffnungszeiten, Kategorie Webdesigner, Leistungen einzeln). Größter Hebel, geringer Aufwand.
2. Herold.at Eintrag (österreichisches Branchenverzeichnis). Hohe Wirkung lokal.
3. FirmenABC.at und WKO-Firmen A bis Z. Vertrauenssignal für Österreich.
4. Google-Bewertungen aktiv einsammeln, jede echte Bewertung hilft SEO und KI-Vertrauen.
5. Meine-Stadt- und Regionalportale für Graz, wo möglich mit einheitlichem NAP.
6. Ein bis zwei kurze Referenz- oder Case-Study-Seiten mit echten Kunden (Himalaya Masala eignet sich).
7. Instagram- oder Facebook-Profil, verlinkt über sameAs, falls du eins pflegst.

Konsistenz-Check (überall exakt gleich schreiben):

- Marke immer "Seitfix", nicht "SeitFix" oder "Seit Fix".
- Adresse immer "Engelgasse 54, 8010 Graz".
- E-Mail immer "hallo@seitfix.at".
- Leistungsnamen immer gleich: Onepager-Website, Online-Shop, Food-Rescue-Shop.
- Preisformat immer "ab 599 Euro" (Google Business) bzw. "ab 599 €" (Website), einheitlich pro Kanal.
- Wenn ein Telefon hinzukommt, überall dieselbe Schreibweise verwenden.

## 7. Interne Verlinkung

- Von der Food-Rescue-Section auf der Startseite zum Food-Rescue-Rechner, Ankertext: "Sparpotenzial berechnen".
- Vom Food-Rescue-Rechner zurück zur Startseite, Ankertext: "Zur Startseite".
- Vom Footer zu Impressum und Datenschutz, Ankertexte "Impressum" und "Datenschutz".
- Sobald Unterseiten existieren: von der Startseite in die Leistungs-Abschnitte verlinken, Ankertexte "Onepager-Website", "Online-Shop", "Food-Rescue-Shop für Restaurants".
- Querverlinkung zu anfragr über den bestehenden Markenumschalter bleibt.

## 8. Technik-Checkliste

- XML-Sitemap: liegt als sitemap.xml im Ordner, in der Google Search Console einreichen.
- robots.txt: liegt im Ordner, verweist auf die Sitemap, erlaubt alle Crawler inklusive KI-Bots.
- HTTPS: über den Hoster erzwingen, http auf https weiterleiten.
- Canonical: auf jeder Seite gesetzt, deutsche und englische Version über hreflang verbunden. Erledigt.
- Ladezeit: Schriften sind lokal gehostet, keine externen Requests. Bilder als komprimierte Formate halten.
- Mobile: Seite ist mobile-first, mit echten Geräten gegenprüfen.
- Strukturierte Daten testen: mit dem Rich Results Test von Google und dem Schema Markup Validator prüfen.
- Google Search Console und ein datensparsames Analytics-Tool einrichten, um Suchanfragen zu sehen.

## 9. Was geändert wurde

- Title und Meta-Description der Startseite: Ort Graz und das Wort günstig ergänzt, Leistungen Website und Online-Shop mit aufgenommen. Grund: lokale Sichtbarkeit und Klick-Anreiz. Sinn unverändert.
- JSON-LD neu hinzugefügt (ProfessionalService mit NAP, WebSite, BreadcrumbList, FAQPage). Grund: strukturierte Daten für Google und KI. Kein sichtbarer Texteingriff.
- llms.txt, robots.txt und sitemap.xml erstellt bzw. aktualisiert. Grund: technische Auffindbarkeit für Such- und KI-Crawler.
- Englische Meta-Tags parallel angepasst. Grund: gleiche Wirkung für die EN-Version.
- Textvorschlag für H1 und Einleitung (Block 2) noch nicht live eingesetzt, da er den sichtbaren Hero verändert. Freigabe von dir nötig, dann setze ich ihn ein.
