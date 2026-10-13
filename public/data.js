// Megacracks LaLiga EA Sports 2026/27 (Panini) — checklist 1ª + 2ª edición
// Fuentes: decromosconjr.es (act. 21/09/2026) contrastado con owacgames.com (2ª edición).
// Formato: "#seccion" o "#team:COD" abre bloque; cada línea "código|nombre|equipo".
// Las cartas de la 3ª edición se pueden añadir desde la app (Ajustes > Añadir carta).

window.MK_TEAMS = {
  ALA: { name: "D. Alavés",          c1: "#1B4F9C", c2: "#FFFFFF" },
  ATH: { name: "Athletic Club",      c1: "#D7141A", c2: "#FFFFFF" },
  ATM: { name: "Atlético de Madrid", c1: "#C8102E", c2: "#1F2A5C" },
  BAR: { name: "FC Barcelona",       c1: "#A50044", c2: "#004D98" },
  BET: { name: "Real Betis",         c1: "#00954C", c2: "#FFFFFF" },
  CEL: { name: "RC Celta",           c1: "#7FBCE8", c2: "#C8102E" },
  DEP: { name: "RC Deportivo",       c1: "#0057A8", c2: "#FFFFFF" },
  ELC: { name: "Elche CF",           c1: "#05642C", c2: "#FFFFFF" },
  ESP: { name: "RCD Espanyol",       c1: "#007FC8", c2: "#FFFFFF" },
  GET: { name: "Getafe CF",          c1: "#005999", c2: "#FFFFFF" },
  LEV: { name: "Levante UD",         c1: "#B4053F", c2: "#003E7E" },
  RMA: { name: "Real Madrid CF",     c1: "#F4F4F4", c2: "#C9A227" },
  MAL: { name: "Málaga CF",          c1: "#6CACE4", c2: "#0B3D91" },
  OSA: { name: "CA Osasuna",         c1: "#D91A21", c2: "#0A346F" },
  RAC: { name: "Racing Club",        c1: "#00A04A", c2: "#FFFFFF" },
  RAY: { name: "Rayo Vallecano",     c1: "#FFFFFF", c2: "#E53027" },
  RSO: { name: "Real Sociedad",      c1: "#0067B1", c2: "#FFFFFF" },
  SEV: { name: "Sevilla FC",         c1: "#FFFFFF", c2: "#D7182A" },
  VAL: { name: "Valencia CF",        c1: "#1A1A1A", c2: "#F18E00" },
  VIL: { name: "Villarreal CF",      c1: "#FFE667", c2: "#005187" },
  LEG: { name: "Leyenda",            c1: "#2B2B2B", c2: "#D4AF37" },
};

// Secciones (orden del álbum). group = filtro rápido. extra = no cuenta por defecto en el progreso.
window.MK_SECTIONS = [
  { id: "elite",   name: "Élite",                 group: "Especiales",  tier: "elite" },
  { id: "eliteP",  name: "Élite Power",           group: "Power",       tier: "power", from: "elite" },
  { id: "team",    name: "Equipos",               group: "Equipos",     tier: "base" },
  { id: "enjoy",   name: "Enjoy",                 group: "Especiales",  tier: "enjoy" },
  { id: "enjoyP",  name: "Enjoy Power",           group: "Power",       tier: "power", from: "enjoy" },
  { id: "vip",     name: "Zona VIP",              group: "Especiales",  tier: "vip" },
  { id: "vipP",    name: "Zona VIP Power",        group: "Power",       tier: "power", from: "vip" },
  { id: "rookie",  name: "Master Rookie",         group: "Especiales",  tier: "rookie" },
  { id: "rookieP", name: "Master Rookie Power",   group: "Power",       tier: "power", from: "rookie", only: ["408", "418", "419", "423"] },
  { id: "stars",   name: "Stars on 25",           group: "Stars on 25", tier: "stars" },
  { id: "starsP",  name: "Stars on 25 Power",     group: "Power",       tier: "power", from: "stars" },
  { id: "j25",     name: "Just 25",               group: "Stars on 25", tier: "j25" },
  { id: "nf",      name: "Nuevos Fichajes",       group: "2ª edición",  tier: "nf", ed: 2 },
  { id: "ind",     name: "Índices",               group: "2ª edición",  tier: "ind", ed: 2 },
  { id: "soch",    name: "Special One Champions", group: "Special One", tier: "soch" },
  { id: "sob",     name: "Special One Black",     group: "Special One", tier: "sob" },
  { id: "sog",     name: "Special One Gold",      group: "Special One", tier: "sog" },
  { id: "edl",     name: "Edición Limitada",      group: "Limitadas y firmas", tier: "edl", extra: true },
  { id: "ao",      name: "Autógrafos",            group: "Limitadas y firmas", tier: "ao",  extra: true },
  { id: "custom",  name: "Añadidas por vosotros", group: "Añadidas",    tier: "custom" },
];

window.MK_RAW = `
#elite
1|Pablo Barrios|ATM
2|Bellingham|RMA
3|Budimir|OSA
4|Courtois|RMA
5|Fede Valverde|RMA
6|Fermín|BAR
7|Giuliano|ATM
8|Julián Álvarez|ATM
9|Lamine Yamal|BAR
10|Mbappé|RMA
11|Moleiro|VIL
12|Nico Williams|ATH
13|Oyarzabal|RSO
14|Pablo Fornals|BET
15|Pedri|BAR
16|Raphinha|BAR
17|Unai Simón|ATH
18|Vinícius|RMA
#team:ALA
19|Escudo
20|Sivera
21|Adrián Rodríguez
22|Jonny
23|Tenaglia
24|Koski
25|Parada
25 Bis|Garcés
26|Yusi
27|Benavidez
28|Blanco
29|Guevara
30|Aleñá
31|Pablo Ibáñez
32|Denis Suárez
33|Ángel Pérez
34|Abde
34 Bis|Mariano
35|Toni Martínez
36|Boyé
#team:ATH
37|Escudo
38|Unai Simón
39|Padilla
40|Areso
41|Vivian
42|Paredes
43|Laporte
44|Yuri
45|Ruiz de Galarreta
46|Jauregizar
47|Rego
47 Bis|Peio Canales
48|Sancet
49|Nico Serrano
50|Berenguer
51|Robert Navarro
52|Williams
53|Guruzeta
54|Nico Williams
#team:ATM
55|Escudo
56|Oblak
57|Musso
58|Marcos Llorente
59|Le Normand
60|Pubill
61|Giménez
62|Hancko
63|Ruggeri
63 Bis|Rodri Mendoza
64|Koke
65|Barrios
66|Johnny Cardoso
67|Álex Baena
68|Almada
68 Bis|Arnau Ortiz
69|Giuliano
70|Lookman
71|Julián Álvarez
72|Sorloth
#team:BAR
73|Escudo
74|Joan García
75|Szczesny
76|Koundé
77|Gerard Martín
78|Cubarsí
79|Eric García
80|Araújo
80 Bis|Christensen
81|Balde
81 Bis|João Cancelo
82|De Jong
83|Marc Bernal
84|Gavi
85|Pedri
86|Fermín
87|Dani Olmo
88|Raphinha
89|Lamine Yamal
90|Ferran Torres
90 Bis|Abdelkarim
#team:BET
91|Escudo
92|Valles
93|Pau López
93 Bis|Diego Conde
94|Aitor Ruibal
95|Bartra
96|Diego Llorente
97|Natan
98|Valentín Gómez
99|Marc Roca
100|Amrabat
100 Bis|Deossa
101|Fidalgo
102|Pablo Fornals
103|Lo Celso
104|Isco
105|Riquelme
106|Antony
107|Cucho Hernández
108|Abde
#team:CEL
109|Escudo
110|Radu
111|Iván Villar
112|Javi Rueda
113|Álvaro Núñez
114|Javi Rodríguez
115|Starfelt
116|Marcos Alonso
117|Carreira
118|Ilaix Moriba
119|Miguel Román
120|Hugo Álvarez
121|Fer López
122|Swedberg
123|Pablo Durán
123 Bis|Hugo González
124|Iago Aspas
125|Borja Iglesias
126|Jutglà
#team:DEP
127|Escudo
128|Álvaro Fernández
129|Germán Parreño
129 Bis|Leo Román
130|Adrià Altimira
131|Loureiro
132|Noubi
133|Dani Barcia
133 Bis|Bright Ede
134|Arnau Comas
135|Quagliata
136|Villares
137|Riki
138|Mario Soriano
139|José Ángel
140|Luismi Cruz
140 Bis|Asp Jensen
141|Mella
142|Yeremay
143|Eddahchouri
144|Bil Nsongo
#team:ELC
145|Escudo
146|Dituro
147|Iturbe
148|Sangaré
149|Chust
150|Bigas
151|Affengruber
152|Pedrosa
152 Bis|Fede Redondo
153|Germán Valera
154|Gonzalo Villar
155|Martim Neto
156|Marc Aguado
157|Josan
158|Morente
159|Aly Houary
160|Diangana
161|Yago Santiago
162|Cepeda
#team:ESP
163|Escudo
164|Dmitrovic
165|Fortuño
166|El Hilali
167|Rubén Sánchez
167 Bis|Núñez
168|Riedel
169|Cabrera
170|Miguel Rubio
170 Bis|Hinojo
171|Hartman
172|Urko
173|Pol Lozano
174|Edu Expósito
175|Jofre
175 Bis|Javi Hernández
176|Dolan
177|Puado
178|Roberto Fernández
179|Kike García
180|Pere Milla
#team:GET
181|Escudo
182|David Soria
183|Letacek
184|Kiko Femenía
185|Djené
186|Boselli
187|Abqar
188|Zaid Romero
189|Davinchi
190|Mario Martín
191|Javi Muñoz
192|Mangala
193|Terrats
194|Juanmi
195|Borja Mayoral
196|Luis Vázquez
196 Bis|Ünal
197|Satriano
198|Álex Sancris
#team:LEV
199|Escudo
200|Ryan
201|Pablo Campos
202|Toljan
203|Dela
204|Elgezabal
205|Mandi
206|Manu Sánchez
207|Oriol Rey
208|Arriaga
208 Bis|Dani Requena
209|Hugo Sotelo
210|Olasagasti
211|Carlos Álvarez
212|Tunde
213|Brugué
214|Iván Romero
215|Carlos Espí
215 Bis|Musuayi
216|Etta Eyong
#team:RMA
217|Escudo
218|Courtois
219|Lunin
220|Trent
221|Militão
222|Huijsen
223|Rüdiger
224|Carreras
225|Tchouaméni
226|Fede Valverde
227|Camavinga
228|Bellingham
229|Güler
230|Brahim Díaz
231|Rodrygo
232|Mbappé
233|Gonzalo
233 Bis|Carlos Espí
234|Vinícius
#team:MAL
235|Escudo
236|Alfonso Herrero
237|Carlos López
238|Puga
239|Murillo
240|Calero
241|Einar Galilea
242|Rafita
243|Salinas
244|Izan Merino
245|Dani Lorenzo
246|Rafa Rodríguez
247|Dotor
248|Larrubia
249|Lobete
250|Adrián Niño
251|Joaquín
252|Chupe
#team:OSA
253|Escudo
254|Sergio Herrera
255|Aitor Fernández
256|Rosier
257|Boyomo
258|Catena
259|Herrando
260|Abel Bretones
261|Iker Muñoz
262|Torró
263|Moncayola
264|Moi Gómez
265|Rubén García
266|Aimar Oroz
267|Raúl Moro
268|Kike Barja
269|Raúl García
270|Budimir
#team:RAC
271|Escudo
272|Agirrezabala
273|Eriksson
274|Mantilla
275|Sangalli
275 Bis|Pablo Ramón
276|Facu González
277|Javi Castro
277 Bis|Pedro Felipe
278|Manu Hernando
279|Jorge Salinas
280|Maguette
281|Gustavo Puerta
282|Íñigo
283|Aldasoro
283 Bis|Sergio Martínez
284|Suleiman
284 Bis|Zabiri
285|Andrés Martín
286|Guliashvili
287|Villalibre
288|Íñigo Vicente
#team:RAY
289|Escudo
290|Batalla
291|Cárdenas
292|Ratiu
293|Balliu
294|Lejeune
295|Nobel Mendy
296|Luiz Felipe
297|Pep Chavarría
297 Bis|Nteka
298|Pedro Díaz
299|Pathé Ciss
300|Óscar Valentín
301|Unai López
302|Isi
303|Álvaro García
304|De Frutos
305|Camello
306|Alemão
#team:RSO
307|Escudo
308|Remiro
309|Marrero
310|Aramburu
311|Jon Martín
312|Zubeldia
313|Sergio Gómez
314|Aihen Muñoz
315|Gorrotxategi
316|Turrientes
317|Pablo Marín
318|Yangel Herrera
319|Carlos Soler
320|Sucic
321|Barrenetxea
322|Guedes
323|Kubo
324|Oyarzabal
#team:SEV
325|Escudo
326|Vlachodimos
327|Fran González
328|Carmona
329|Juanlu
329 Bis|Iglesias
330|Kike Salas
331|Nianzou
331 Bis|Sangante
332|Castrín
333|Suazo
334|Oso
335|Agoumé
336|Sow
336 Bis|Manu Bueno
337|Vargas
338|Miguel Sierra
339|Peque
340|Ejuke
341|Akor Adams
341 Bis|Robbie Ure
342|Isaac Romero
#team:VAL
343|Escudo
344|Dimitrievski
345|Rivero
346|Foulquier
347|Diakhaby
348|Tárrega
349|Copete
350|Cömert
350 Bis|De Haas
351|Gayà
352|Pepelu
353|Guido Rodríguez
354|Javi Guerra
355|Luis Rioja
356|Ugrinic
357|Ramazani
358|Hugo Duro
359|Diego López
360|Sadiq
#team:VIL
361|Escudo
362|Luiz Júnior
363|Arnau Tenas
363 Bis|Gulácsi
364|Mouriño
365|Pau Navarro
366|Foyth
367|Logan Costa
368|Renato Veiga
369|Sergi Cardona
370|Santi Comesaña
371|Maciá
372|Pape Gueye
373|Moleiro
374|Buchanan
375|Pépé
376|Mikautadze
377|Ayoze
378|Gerard Moreno
#enjoy
379|Abde|BET
380|Brahim Díaz|RMA
381|Dani Olmo|BAR
382|Dolan|ESP
383|Íñigo Vicente|RAC
384|Kubo|RSO
385|Lookman|ATM
386|Pépé|VIL
387|Vargas|SEV
#vip
388|Antony|BET
389|Borja Iglesias|CEL
390|Carlos Soler|RSO
391|Cubarsí|BAR
392|De Frutos|RAY
393|Eric García|BAR
394|Gavi|BAR
395|Guedes|RSO
396|Güler|RMA
397|Hancko|ATM
398|Jauregizar|ATH
399|Joan García|BAR
400|Koke|ATM
401|Marcos Llorente|ATM
402|Mikautadze|VIL
403|Oblak|ATM
404|Pubill|ATM
405|Tchouaméni|RMA
#rookie
406|Abdelkarim|BAR
407|Antañón|CEL
408|Carlos Espí|LEV
409|Chupe|MAL
410|Cubo|ATM
411|Dani Díaz|RSO
412|Hugo López|VIL
413|Joan Martínez|RMA
414|Jorge Salinas|RAC
415|Julio Díaz|ATM
416|Lamini Fati|RMA
417|Maciá|VIL
418|Rego|ATH
419|Thiago Pitarch|RMA
420|Tommy Marqués|BAR
421|Tunde|LEV
422|Xavi Espart|BAR
423|Yeremay|DEP
#stars
424|MGK 25 Aniversario|LEG
425|Collage de leyendas|LEG
426|Raúl|RMA
427|Xavi|BAR
428|Casillas|RMA
429|Puyol|BAR
430|Zidane|RMA
431|Joaquín|BET
432|Fernando Torres|ATM
433|Aduriz|ATH
434|Iniesta|BAR
435|Villa|VAL
436|Ronaldinho|BAR
437|Jesús Navas|SEV
438|Cazorla|VIL
439|Forlán|ATM
440|Messi|BAR
441|Benzema|RMA
442|Cristiano Ronaldo|RMA
443|Griezmann|ATM
444|Iago Aspas|CEL
445|Modric|RMA
446|Neymar|BAR
447|Oblak|ATM
448|Oyarzabal|RSO
449|Lamine Yamal|BAR
450|Mbappé|RMA
#j25
J25-1|Cristiano Ronaldo|RMA
J25-2|Messi|BAR
#nf
451|Cucurella|RMA
452|Amatucci|DEP
453|Sato|VAL
454|Calatrava|ESP
455|Fran García|BET
456|Mikel Rodríguez|ALA
457|Sazonov|GET
458|Juan Cruz|MAL
459|Grimaldo|ATM
460|Canales|RAC
461|Guridi|SEV
462|Mojica|GET
463|Gijselhart|DEP
464|Konaté|RMA
465|Fer Niño|ELC
466|Carlos Romero|VIL
467|Dubasin|OSA
468|Gordon|BAR
469|Hjulmand|ATM
470|Bardeli|LEV
471|Angeliño|DEP
472|Dumfries|RMA
473|Javi Morcillo|ELC
474|Andrés García|GET
475|Valentini|ALA
476|Drkusic|ESP
477|Julio Díaz|SEV
478|Diomandé|RMA
479|Francho|GET
480|Buonanotte|ELC
481|Iván Martín|RAC
482|Moscardó|ESP
483|Febas|CEL
484|Facundo Bernal|BET
485|Aubameyang|DEP
486|Kang-in Lee|ATM
487|Dieng|VAL
488|Bernardo Silva|RMA
489|Adeyemi|BAR
#ind
IND2.1|Índice 2ª ed. (Bis)|LEG
IND2.2|Índice 2ª ed. (Fichajes)|LEG
#soch
SO-CH1|Atlético: 2 Ligas|ATM
SO-CH2|Barcelona: 13 Ligas|BAR
SO-CH3|Real Madrid: 8 Ligas|RMA
SO-CH4|Valencia: 1 Liga|VAL
#sob
SOB1|Pedri|BAR
SOB2|Joan García|BAR
SOB3|Nico Williams|ATH
SOB4|Julián Álvarez|ATM
SOB5|Vinícius|RMA
SOB6|Oyarzabal|RSO
SOB7|Raphinha|BAR
SOB8|Moleiro|VIL
SOB9|Fede Valverde|RMA
#sog
SOG1|Koke|ATM
SOG2|Lamine Yamal|BAR
SOG3|Mbappé|RMA
#edl
EDL1|Lamine Yamal (Top Crack)|BAR
EDL2|Mbappé (Top Goleador)|RMA
EDL3|Víctor Muñoz (Top Revelación)|OSA
EDL4|Kang-in Lee (Top Fichaje)|ATM
EDL5|Adeyemi (Top Fichaje)|BAR
EDL6|Canales (Top Fichaje)|RAC
#ao
AO200-1|Sivera #/200|ALA
AO200-2|Aitor Paredes #/200|ATH
AO200-3|Pablo García #/200|BET
AO200-4|Febas #/200|CEL
AO200-5|Javi Guerra #/200|VAL
AO200-6|Roberto Fernández #/200|ESP
AO200-7|David Soria #/200|GET
AO200-8|Kike Salas #/200|SEV
AO100-1|Carlos Soler #/100|RSO
AO100-2|Batalla #/100|RAY
AO100-3|Buchanan #/100|VIL
AO100-4|Pubill #/100|ATM
AO100-5|Unai Gómez #/100|ATH
AO100-6|Antonio Blanco #/100|ALA
AO50-1|Giuliano Simeone #/50|ATM
AO50-2|Iñaki Williams #/50|ATH
AO50-3|Víctor Muñoz #/50|OSA
AO50-4|Gerard Martín #/50|BAR
DAO50-1|Pitarch y Güler #/50|RMA
DAO50-2|Moleiro y Gerard Moreno #/50|VIL
AO5-1|Pedri #/5|BAR
AO5-2|Julián Álvarez #/5|ATM
SAO-1|Simeone (Status) #/100|ATM
SAO-2|Stoichkov (Status) #/100|BAR
SAO-3|Casillas (Status) #/100|RMA
SAO-4|Xabi Alonso (Status) #/100|RMA
SAO-5|Raúl (Status) #/100|RMA
SAO-6|Cazorla (Status) #/100|VIL
SAO-7|Mbappé (Status) #/1|RMA
SAO-8|Messi (Status)|BAR
`;
