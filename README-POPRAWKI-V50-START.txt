V50 — poprawki tylko strony głównej / start

Ruszone pliki:
- index.html
- style.css
- script.js
- script-core.js

Zakres:
1. HP slider/hero:
   - wyłączone wejściowe overlaye/pulsowanie
   - usunięty scale/zoom między klatkami hero
   - stabilniejsze ładowanie pierwszego kadru

2. Zakres współpracy na stronie głównej:
   - płynne otwieranie harmonijek przez dynamiczny max-height
   - ikonka plusa nie skaluje się, więc nie powinna się przycinać
   - hover zostawiony: dolny border + subtelny slide tekstu + obrót ikony

3. Wybrane realizacje:
   - shade obejmuje cały kafel
   - usunięty problem z borderem/warstwą po hoverze

4. Kontakt na dole strony głównej:
   - kontener ma szerokość zgodną z resztą layoutu
   - line-height i margines H2 poprawione, żeby nie nachodził na paragraf

5. Social media / FAQ:
   - FAQ wyrównane do góry
   - telefon ma object-fit: cover i bez parallax transform, żeby nie migał odstęp
