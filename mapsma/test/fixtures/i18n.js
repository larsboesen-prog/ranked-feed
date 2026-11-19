/* Spanish / English for the public pages (/, /page2, /page3). Load right after data.js.
   Language: the reader's own choice (localStorage "sma-lang", set by the ES|EN switch), else the browser's language — Spanish if it starts with "es", otherwise English.
   T("English text") gives the Spanish when the page is in Spanish; T("x {n}",{n:3}) fills in {n}. Keys that are not English sentences (e.g. "n-places") live in EN too.
   Static text in the HTML is marked data-t (text), data-th (HTML) or data-tp (placeholder); its English is the key. */
(function(){
  let L=null; try{ L=localStorage.getItem("sma-lang"); }catch(e){}
  if(L!=="es"&&L!=="en") L=String((navigator.languages&&navigator.languages[0])||navigator.language||"en").toLowerCase().startsWith("es")?"es":"en";
  window.LANG=L; document.documentElement.lang=L;

  const EN={
    "n-places":"{n} places","n-place":"{n} place","n-sights":"{n} sights","n-sight":"{n} sight",
    "saved-filter":"★ Saved",
    "checked-on":"Checked {date}",
    "when-note-map":"{q}{n} places don't list hours for {day} online, so they're hidden — check them on Google Maps. Sights, street food and wineries always stay on the map.",
    "when-means":"“{label}” means {hint} on {day}. ",
    "about-who":"<b>Picked by locals.</b> Every place here is chosen by a small group of Mexicans and expats who live in San Miguel de Allende. The guide is free, and we add and remove places as we see fit.",
    "about-hours":"<b>Opening hours</b> come from Google Maps and are refreshed once a month. Owners: keep your Google Maps listing up to date and the change will show here within a month.",
    "about-photos":"<b>Photos</b> are our own, from Wikimedia Commons and Flickr (credited), or from the owners. If we got something wrong, let us know.",
    "about-map":"<b>The map</b> uses real OpenStreetMap streets, parks and water, restyled. City blocks are drawn from the street network as a stand-in for buildings.",
    "about-contact":"We'd love to hear from you. Email <a href=\"mailto:hello@mapsma.com\">hello@mapsma.com</a> with feedback or suggestions, or to ask us to remove a place or a photo.",
    "about-save":"Tap ★ to save places; saves stay on this device.",
    "when-note-cards":"Places that don't list their hours online are hidden."
  };
  const ES={
    // titles and headers
    "San Miguel de Allende · Eat, Drink & See":"San Miguel de Allende · Come, bebe y pasea",
    "San Miguel de Allende · Places in photos":"San Miguel de Allende · Lugares en fotos",
    "Where to eat, drink and wander in San Miguel de Allende, picked by people who actually live here.":"Dónde comer, beber y pasear en San Miguel de Allende, elegido por gente que de verdad vive aquí.",
    "Eat, drink & wander":"Come, bebe y pasea",
    "by people who actually live here":"por gente que de verdad vive aquí",
    "Photos":"Fotos","Map":"Mapa","About":"Info",
    "See all places →":"Ver todos los lugares →",
    "Tap any photo to see all places.":"Toca cualquier foto para ver todos los lugares.",
    "Photos — ":"Fotos: ","Photos are coming soon.":"Pronto habrá fotos.",
    "Sites we recommend":"Sitios que recomendamos",
    "Food blogger · cupcakesandcrablegs.com":"Blog de comida · cupcakesandcrablegs.com",
    // filters and lists
    "All places":"Todos","Search a place or street…":"Busca un lugar o una calle…",
    "saved-filter":"★ Guardados","Places":"Lugares","Show list ▲":"Ver lista ▲","Hide list ▼":"Ocultar lista ▼",
    "When?":"¿Cuándo?","When · today":"Cuándo · hoy","Any time":"Cualquier hora",
    "Open now":"Abierto ahora","Open today":"Abierto hoy","Breakfast":"Desayuno","Lunch":"Comida","Dinner":"Cena","Late night":"Noche",
    "open for at least an hour between 8:00 and 10:30":"abierto al menos una hora entre las 8:00 y las 10:30",
    "open for at least 90 minutes between 13:00 and 16:00":"abierto al menos 90 minutos entre las 13:00 y las 16:00",
    "open for at least an hour between 19:30 and 21:30":"abierto al menos una hora entre las 19:30 y las 21:30",
    "open until 23:30 or later":"abierto hasta las 23:30 o más tarde",
    " tomorrow":" mañana"," today":" hoy",
    "n-places":"{n} lugares","n-place":"{n} lugar","n-sights":"{n} para ver","n-sight":"{n} para ver",
    "when-note-map":"{q}{n} lugares no publican en internet su horario del {day}, así que se ocultan; consúltalos en Google Maps. Los sitios para ver, la comida callejera y los viñedos siempre aparecen en el mapa.",
    "when-means":"«{label}» significa {hint} el {day}. ",
    "when-note-cards":"Se ocultan los lugares que no publican su horario en internet.",
    "Nothing saved yet — open a place and tap ☆ Save.":"Aún no has guardado nada: abre un lugar y toca ☆ Guardar.",
    "No matches.":"Sin resultados.",
    // opening hours
    "Today {h}":"Hoy {h}","Open now · until {t}":"Abierto ahora · hasta las {t}","Closing soon · until {t}":"Cierra pronto · hasta las {t}",
    "Closed today":"Cerrado hoy","Opens at {t}":"Abre a las {t}","Closed for today":"Ya cerró por hoy",
    "All week":"Toda la semana","Closed":"Cerrado","not listed":"sin datos",
    "Hours not published online — check Google Maps":"Horario no publicado en internet; consulta Google Maps",
    "source":"fuente","checked-on":"Revisado el {date}","Checked Nov 2026":"Revisado en nov. 2026",
    "Exact":"Ubicación exacta","On its street":"En su calle","Approximate location":"Ubicación aproximada",
    // card
    "Photo":"Foto","Directions ↗":"Cómo llegar ↗","🗺 Show on the map":"🗺 Ver en el mapa",
    "☆ Save":"☆ Guardar","★ Saved":"★ Guardado","Share":"Compartir","Link copied ✓":"Enlace copiado ✓","Copy this link:":"Copia este enlace:",
    // map page
    "About this map":"Sobre este mapa","Got it":"Entendido","Map data":"Datos del mapa",
    "about-who":"<b>Elegidos por gente de aquí.</b> Cada lugar lo elige un pequeño grupo de mexicanos y extranjeros que viven en San Miguel de Allende. La guía es gratuita, y agregamos o quitamos lugares según nuestro criterio.",
    "about-hours":"<b>Los horarios</b> vienen de Google Maps y se actualizan una vez al mes. Si tienes un negocio, mantén al día tu ficha de Google Maps y el cambio aparecerá aquí en menos de un mes.",
    "about-photos":"<b>Las fotos</b> son nuestras, de Wikimedia Commons y Flickr (con su crédito) o de los propios negocios. Si nos equivocamos en algo, avísanos.",
    "about-map":"<b>El mapa</b> usa calles, parques y agua reales de OpenStreetMap, con un estilo propio. Las manzanas se dibujan a partir de las calles como representación de los edificios.",
    "about-contact":"Nos encantaría saber de ti. Escribe a <a href=\"mailto:hello@mapsma.com\">hello@mapsma.com</a> con comentarios o sugerencias, o para pedirnos quitar un lugar o una foto.",
    "about-save":"Toca ★ para guardar lugares; se quedan en este dispositivo.",
    // homepage captions (scenes.json)
    "A calavera over the door":"Una calavera sobre la puerta","Flame vine":"Lluvia de fuego","A door full of hearts":"Una puerta llena de corazones",
    "Sawdust carpet, Bellas Artes":"Tapete de aserrín, Bellas Artes","On the plate":"En el plato","Fireworks over the centro":"Fuegos artificiales sobre el centro",
    "Bougainvillea":"Bugambilia","Parroquia in fiesta":"La Parroquia de fiesta","An old door":"Una puerta antigua","Marigold carpet":"Tapete de cempasúchil",
    "Christmas stars":"Estrellas navideñas","Paper-flower donkey":"Burrito de flores de papel","A door in flowers":"Una puerta entre flores",
    "Rostros del Cine mural":"Mural Rostros del Cine","Marigolds in the Jardín":"Cempasúchil en el Jardín","Nopal in bloom":"Nopal en flor",
    "Chapel courtyard":"Patio de la capilla","Mariachis at an altar":"Mariachis en un altar"
  };
  const DAYS={en:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],es:["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]}[L];
  window.DAYS=DAYS;
  window.DAY_IN=d=>L==="es"?DAYS[d].toLowerCase():DAYS[d];   // a day name inside a sentence
  window.T=(s,v)=>{ let r=(L==="es"?ES[s]:EN[s]); if(r==null) r=EN[s]!=null?EN[s]:s;
    return v?r.replace(/\{(\w+)\}/g,(m,k)=>k in v?v[k]:m):r; };

  // place data in Spanish (names stay as they are)
  if(L==="es"){
    const CAT={bfast:"Café y panadería",mex:"Mexicana",world:"Cocina del mundo",street:"Comida callejera",share:"Bares y botanas",roof:"Terrazas",wine:"Viñedos",shop:"Para llevar a casa",sights:"Qué ver"};
    const AREA={
      // the extra places, not our picks (/page5 only, 18 Nov 2026)
      "Centro · Mesones, in Casa Hoyos":"Centro · Mesones, en Casa Hoyos",
      "Obraje, near Fábrica La Aurora":"Obraje, cerca de la Fábrica La Aurora",
      "Centro · the market on Colegio":"Centro · el mercado de la calle Colegio",
      "Centro · north of Insurgentes":"Centro · al norte de Insurgentes","Inside the Biblioteca Pública":"Dentro de la Biblioteca Pública",
      "Behind the Parroquia":"Detrás de la Parroquia","Insurgentes & Hidalgo":"Insurgentes e Hidalgo","Centro · ice cream":"Centro · nieves",
      "Main square (Jardín)":"Plaza principal (Jardín)","Hernández Macías, north":"Hernández Macías, norte","Centro · near Loreto":"Centro · cerca de Loreto",
      "Near the Oratorio":"Cerca del Oratorio","Relox & Mesones":"Relox y Mesones","Mesones, east":"Mesones, oriente",
      "Pila Seca & Hernández Macías":"Pila Seca y Hernández Macías","Zacateros, south":"Zacateros, sur","Near Parque Juárez":"Cerca del Parque Juárez",
      "Mesones & Hidalgo":"Mesones e Hidalgo","South of the Parroquia":"Al sur de la Parroquia","Zacateros & Ancha":"Zacateros y Ancha",
      "Recreo, near Parque Juárez":"Recreo, cerca del Parque Juárez","Correo & Recreo":"Correo y Recreo","Zacateros & Nemesio Diez":"Zacateros y Nemesio Diez",
      "Los Frailes · second branch of La Frontera":"Los Frailes · segunda sucursal de La Frontera",
      "Centro · Hidalgo, a block from the Parroquia":"Centro · Hidalgo, a una cuadra de la Parroquia",
      "La Lejona · inside Villa Pajaritos, south of town":"La Lejona · dentro de Villa Pajaritos, al sur de la ciudad",
      "Calzada de la Estación · near the bus station":"Calzada de la Estación · cerca de la central de autobuses",
      "Out of town · countryside ~14 km north":"Fuera de la ciudad · en el campo, ~14 km al norte",
      "Out of town · Donolo, ~6 km west":"Fuera de la ciudad · Donolo, ~6 km al poniente",
      "Out of town · km 3.5 to Dolores Hidalgo":"Fuera de la ciudad · km 3.5 a Dolores Hidalgo",
      "Out of town · El Vergel de los Laureles":"Fuera de la ciudad · El Vergel de los Laureles",
      "Out of town · road to Comonfort, ~15 km south":"Fuera de la ciudad · carretera a Comonfort, ~15 km al sur",
      "Centro · Sollano, a block from the Parroquia":"Centro · Sollano, a una cuadra de la Parroquia",
      "Main square":"Plaza principal","Heart of the centro":"Corazón del centro","Canal & Zacateros":"Canal y Zacateros",
      "San Francisco & Juárez":"San Francisco y Juárez","Plaza Cívica area":"Zona de la Plaza Cívica","Off Loreto":"Junto a Loreto",
      "South of the centro":"Al sur del centro","Recreo & Hospicio":"Recreo y Hospicio","Botanical garden, east of town":"Jardín botánico, al oriente de la ciudad",
      "Out of town · Atotonilco, ~14 km north":"Fuera de la ciudad · Atotonilco, ~14 km al norte"
    };
    const DESC={
      66:"Comida casera mexicoamericana: la sucursal de Los Frailes del clásico favorito de San Antonio, abierta en junio de 2026.",
      67:"Platillos internacionales y mexicanos con barra de sushi (Murasaki), cócteles y una gran carta de vinos, en una casa estilo hacienda.",
      68:"Restaurante en azotea con vista al atardecer y menú internacional de temporada con toques mexicanos; hay menú degustación.",
      69:"Restaurante en la ecocomunidad y centro cultural Villa Pajaritos, con música en vivo y cenas los viernes.",
      70:"Lugar sencillo de día para tacos de birria, consomé y chilaquiles de birria, además de café de olla. Llega temprano.",
      71:"Pequeño lugar familiar en una casa: platillos caseros mexicanos económicos, tacos, trucha y carne, con patio.",
      72:"Pequeño local asiático con barra y discos en el tocadiscos: dumplings, bao y ramen.",
      73:"Café de barrio para desayunar y almorzar (pan con aguacate, tacos de pescado, sopa de tortilla) y espresso.",
      74:"Restaurante con jardín de una pareja italiana que sirve cocina casera siciliana, solo con reservación.",
      75:"Menú italiano fijo que cambia cada semana, con muy pocas mesas.",
      76:"Bistró en un patio con jardín y tienda gourmet (deli, quesos, vinos): una parada clásica para comer, con Cava Garambullo al lado.",
      77:"Pequeña cava de vino natural que elabora mezclas sin filtrar casi a mano; catas con cita.",
      78:"Gran viñedo con recorridos y catas programados, el restaurante Trasiego y tienda de vinos.",
      80:"La cocina reconfortante y global del chef Donnie Masterton, desde 2008 en un elegante patio colonial, con bar y brunch los fines de semana.",
      81:"Café relajado al fondo de Fábrica La Aurora: café, desayunos y comidas ligeras, con estacionamiento gratis en La Aurora.",
      S1:"La iglesia neogótica rosa que define el horizonte; se ve mejor iluminada al anochecer desde el Jardín.",
      S2:"La plaza principal: laureles, bancas, mariachis y antojitos (ver 23 y 24).",
      S3:"Casa natal del héroe de la Independencia Ignacio Allende, hoy museo de historia.",
      S4:"Antiguo convento convertido en centro de artes, con claustro y un mural de Siqueiros.",
      S5:"«Las Monjas»: su alta cúpula se ve desde toda la ciudad.",
      S6:"Biblioteca pública con murales y un patio con café (Café Santa Ana).",
      S7:"Fachada churrigueresca frente a una pequeña plaza.",
      S8:"Oratorio barroco a un lado de la Plaza Cívica.",
      S9:"Un largo callejón de puestos de artesanía: hojalata, vidrio, textiles, papel picado.",
      S10:"Parque sombreado con arroyo, fuentes y canchas de básquetbol.",
      S11:"La histórica plaza de toros de la ciudad.",
      S12:"Histórica escuela de arte en una antigua hacienda; galerías y jardines.",
      S13:"El mirador clásico sobre las cúpulas y la Parroquia.",
      S14:"Reserva natural y jardín botánico con cactáceas, un cañón y una presa.",
      S15:"Antigua fábrica textil convertida en galerías de diseño y arte.",
      S16:"Santuario del siglo XVIII con techos cubiertos de murales de barroco popular: la «Capilla Sixtina de México». Patrimonio de la Humanidad de la UNESCO."
    };
    const NOTE={
      1:"Una fuente dice que cierra los miércoles",11:"Tel. 415 150 0135",12:"Desayunos y comidas",13:"Suele agotarse temprano",
      18:"Otra fuente dice que cierra a las 18:30",20:"Carrito de tacos por la noche",21:"Puesto de nieves",22:"Puesto nocturno",
      23:"Puesto callejero",24:"Puesto callejero",25:"Puesto callejero",27:"Puesto de mercado",
      29:"No aparece en internet",31:"No aparece en internet",32:"No aparece en internet",56:"No aparece en internet",
      34:"No hay datos del lunes",61:"No hay datos del lunes",43:"No hay datos del martes",54:"No hay datos del miércoles",
      38:"Nombre tomado de un logotipo; no aparece en internet",44:"Terraza de martes a domingo",47:"Tel. +52 415 152 4511",
      50:"Las fuentes no coinciden",51:"Tel. +52 415 110 2202",52:"Las fuentes no coinciden; confirma por teléfono al 415-154-7874",
      57:"Mezcalería",65:"Sitio web caído; puede haber cerrado",
      66:"Abrió en junio de 2026; horario del anuncio de apertura. Tel. 415 120 0850",
      67:"Registrado como Estoril y Murasaki. Otra fuente dice lun–sáb 13:00–23:00, dom 13:00–19:00",
      68:"Happy hour jue–vie 16:00–18:00",69:"Solo encontramos una ficha en internet; confirma que esté abierto antes de ir",
      71:"Solo efectivo. Otra fuente dice diario 13:00–21:00; todas coinciden en que cierra los martes",
      72:"Se recomienda reservar; una fuente más antigua indica solo horario nocturno",73:"Las fuentes no coinciden en la dirección",
      74:"Tel. 415 124 2435 · sikelia.com.mx",75:"Se recomienda reservar · Tel. +52 415 168 7465",76:"Tel. 415 110 2063",
      77:"Solo con cita: reserva una cata por correo (natalia@vinograd.mx)",
      78:"Reserva los recorridos en línea. Restaurante Trasiego jue–sáb 13:00–21:00, dom 13:00–20:00",
      79:"Es sobre todo un desarrollo residencial privado; quizá no se pueda visitar. Pin colocado en el km 11 de forma aproximada",
      80:"Las fuentes difieren un poco (una menciona brunch dominical desde las 10:00). Se sugiere reservar los fines de semana · Tel. 415 154 7862",
      81:"Otras fichas dan horarios un poco distintos (una dice vie hasta las 20:00, dom hasta las 16:00)",
      S16:"Entrada libre, se agradece donativo. Algunas partes pueden cerrar durante misas y retiros de peregrinos."
    };
    for(const k in window.CATS||{}) if(CAT[k]) window.CATS[k].label=CAT[k];
    for(const p of window.PLACES||[]){ if(AREA[p.area]) p.area=AREA[p.area]; if(p.desc&&DESC[p.id]) p.desc=DESC[p.id]; }
    for(const id in window.INFO||{}){ const i=window.INFO[id]; if(i.note&&NOTE[id]) i.note=NOTE[id]; }
  }

  // static text in the page
  document.title=T(document.title);
  const md=document.querySelector('meta[name="description"]'); if(md) md.content=T(md.content);
  document.querySelectorAll("[data-t]").forEach(e=>e.textContent=T(e.dataset.t||e.textContent.trim()));
  document.querySelectorAll("[data-th]").forEach(e=>e.innerHTML=T(e.dataset.th||e.innerHTML.trim()));
  document.querySelectorAll("[data-tp]").forEach(e=>e.placeholder=T(e.placeholder));

  // the ES | EN switch, top right
  const css=document.createElement("style");
  css.textContent='.lang{display:inline-flex;border:1px solid #e7decd;border-radius:99px;background:#fff;padding:2px;gap:1px;flex:none}'+
    '.lang button{font:700 11px/1 "DM Sans",system-ui,sans-serif;letter-spacing:.04em;padding:4px 7px;border-radius:99px;border:0;background:none;color:#7a7268;cursor:pointer}'+
    '.lang button.on{background:#1f2630;color:#fff}';
  document.head.appendChild(css);
  document.querySelectorAll(".lang").forEach(box=>{
    box.setAttribute("role","group"); box.setAttribute("aria-label","Idioma / Language");
    box.innerHTML=["es","en"].map(l=>`<button type="button" lang="${l}" class="${l===L?"on":""}" aria-pressed="${l===L}">${l.toUpperCase()}</button>`).join("");
    box.querySelectorAll("button").forEach(b=>b.onclick=()=>{ if(b.lang===L) return; try{localStorage.setItem("sma-lang",b.lang);}catch(e){} location.reload(); });
  });
})();
