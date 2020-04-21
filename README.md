# Projet IOT Nodejs

## Sujet : Géolocalisation dans un aéroport à l'aide d'un signal wifi.

### MVP :

Prototype Arduino composé de deux leds :
  - Une led rouge
  - Une led verte
Possibilité de découper l'aéroport en différentes "zones" selon les aéroports.

### Utilité coté utilisateur :

- Savoir le moment où les portes d'embarquement sont ouvertes.
- Savoir s’il est loin des portes.
- Savoir le temps restant pour rejoindre les portes.

### Utilité coté client : 

- Statistiques liées aux endroits les plus fréquentés.
- Statistiques liées aux endroits où il a passé le plus de temps, exemple : zone de contrôle.
- Afficher des points sur une carte d'aéroport.
- Détecter la sortie de l'aéroport.


### Scénario : 

M. Gilles Le Conquérant a réservé un vol Nice - Bangkok.
Il arrive à l'aéroport. 
Il passe les portiques de sécurité. 
A la fin du contrôle on lui donne l'objet Arduino (programmé pour son billet). 
Tant que les portes d'embarquement sont fermées aucune des leds n'est allumée.
Dès que les portes sont ouvertes les leds s’allument : 
  - Si les portes d'embarquement sont ouvertes et que Gilles est loin des portes (plus de 1 zone d'écart entre les portes et Gilles) alors la led rouge s'allume.
  - A l'inverse si Gilles est près des portes la led verte s'allume signalant que les portes d'embarquement sont ouvertes. 
Gilles décide de s'arrêter acheter des magasine sur l'IOT avant de prendre l'avion. 
Il voit l'une des leds clignoter l'avertissant qu’il ne lui reste plus que la moitié du temps pour embarquer. 
Gilles arrive sereinement à son embarquement et peut prendre son vol en 1ère classe.
