// Hand-drawn line icons for the sights (64×64, stroke only). Used by /page3 (big, in ink) and the main map (small, faint).
// Each value is the SVG inner markup; wrap it with your own <svg viewBox="0 0 64 64" fill=… stroke=…>.
(function(){ const G=d=>d;
window.SMA_ICON_PATHS={
 // Parroquia: neo-gothic façade with pointed spires
 S1:G(`<path d="M20 62V30l3-6 3 6v32M38 62V30l3-6 3 6v32"/><path d="M26 62V22l6-18 6 18v40z"/><path d="M14 62V40l2-4 2 4v22M46 62V40l2-4 2 4v22"/><path d="M18 62h28"/><path d="M28 62V50a4 4 0 0 1 8 0v12"/><path d="M30 32v6M34 32v6M23 34v4M41 34v4M32 14v4"/><path d="M8 62h48"/>`),
 // Bellas Artes: cloister with two rows of arches
 S4:G(`<path d="M6 60V22h52v38z"/><path d="M6 22l4-6h44l4 6"/>${[0,1,2,3,4].map(i=>`<path d="M${10+i*10} 40v-8a4 4 0 0 1 8 0v8"/><path d="M${10+i*10} 58v-10a4 4 0 0 1 8 0v10"/>`).join("")}<path d="M6 42h52"/>`),
 // San Francisco: baroque church, dome and bell tower
 S7:G(`<path d="M8 62V34h22v28z"/><path d="M8 34l11-8 11 8"/><path d="M15 62v-9a4 4 0 0 1 8 0v9"/><path d="M36 62V24h12v38"/><path d="M38 24v-8h8v8M40 16v-5h4v5M42 11V6"/><path d="M39 32h6v6h-6zM39 44h6v6h-6z"/><path d="M48 62V42h8v20"/><path d="M48 42a4 5 0 0 1 8 0"/><path d="M4 62h56"/>`),
 // Mercado de Artesanías: papel picado banners on a string
 S9:G(`<path d="M2 14q30 10 60 0"/>${[0,1,2,3,4].map(i=>{const x=6+i*11,y=16+(i===2?3:(i%2?2:0));return `<path d="M${x} ${y}h9v14l-2-2-2.5 2-2.5-2-2 2z"/><circle cx="${x+4.5}" cy="${y+5}" r="1.6"/><path d="M${x+2} ${y+10}h5"/>`}).join("")}<path d="M16 62V44l8-8 8 8v18M32 62V44l8-8 8 8v18"/><path d="M12 62h40"/><path d="M20 54h8M36 54h8"/>`),
 // Parque Juárez: big tree and a bench
 S10:G(`<path d="M30 62V40M30 46l-6-6M30 44l7-7"/><path d="M14 30c-6-10 4-20 12-16 2-8 16-8 18 0 8-2 14 8 8 16 4 8-6 14-12 10-4 4-14 4-18 0-6 4-14-2-8-10z"/><path d="M40 56h18M42 56v6M56 56v6M40 52h18"/><path d="M6 62h52"/>`),
 // Instituto Allende: arched colonial gateway
 S12:G(`<path d="M8 62V22h48v40"/><path d="M8 22l24-10 24 10"/><path d="M22 62V40a10 10 0 0 1 20 0v22"/><path d="M14 30h6v6h-6zM44 30h6v6h-6z"/><path d="M32 18v-6"/><path d="M4 62h56"/>`),
 // El Mirador: balustrade looking over the town and the Parroquia
 S13:G(`<path d="M4 34q10-6 20-2t20-2 16 2"/><path d="M28 34V20l2-6 2 6v14M24 34v-8l1-3 1 3v8M34 34v-8l1-3 1 3v8"/><path d="M10 34v-5h6v5M44 34v-6h8v6"/><path d="M4 46h56M4 50h56"/>${[0,1,2,3,4,5,6].map(i=>`<path d="M${7+i*8.5} 50v10M${10+i*8.5} 50v10"/>`).join("")}<path d="M4 60h56"/>`),
 // El Charco: cactus and agave
 S14:G(`<path d="M22 62V14a5 5 0 0 1 10 0v48"/><path d="M22 38h-6a4 4 0 0 1-4-4V22a3 3 0 0 1 6 0v10h4M32 32h6V18a3 3 0 0 1 6 0v14a4 4 0 0 1-4 4h-8"/><path d="M27 18v6M27 30v6M27 44v6"/><path d="M48 62l-4-12M50 62l1-14M52 62l6-10M46 62l-8-8"/><path d="M6 62h54"/>`),
 // Fábrica La Aurora: old mill, saw-tooth roof and chimney
 S15:G(`<path d="M6 62V34l10-8v8l10-8v8l10-8v8l10-8v36"/><path d="M46 62V12h6v50"/><path d="M45 12h8"/><path d="M50 8c4-2 2-6 6-6"/><path d="M12 44h6v8h-6zM24 44h6v8h-6zM36 44h6v8h-6z"/><path d="M2 62h58"/>`),
};
})();
