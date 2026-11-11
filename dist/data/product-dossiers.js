/* Données formulaires et contenants par soin, alignées sur data/products.js. */
window.CSKIN_PRODUCT_DOSSIERS = {
  'serum-age-plus-1': {
    code: 'RÉF · CSK-SAP-01',
    format: 'FLACON COMPTE-GOUTTES · 30 ML',
    sub: 'Synergie concentrée à 11,2 % d’actifs ciblés',
    order: 'ÉTAPE 02 · AVANT LA CRÈME',
    bars: [
      { label: 'Collagène', pct: '6,0 %', w: 88 },
      { label: 'Gatuline® Expression (Acmella Oleracea)', pct: '4,0 %', w: 68 },
      { label: 'Acide hyaluronique', pct: '0,6 %', w: 34 },
      { label: 'Ectoin®', pct: '0,5 %', w: 28 },
      { label: 'Vitamine E', pct: '0,1 %', w: 16 }
    ],
    details: [
      {
        title: 'Gatuline® Expression 4 % — Effet lissant ciblé',
        body: 'Extrait d’Acmella Oleracea relaxant les micro-tensions pour lisser les rides d’expression.'
      },
      {
        title: 'Collagène 6 % & Acide hyaluronique 0,6 %',
        body: 'Soutiennent la souplesse cutanée et préparent l’épiderme avant votre crème habituelle.'
      },
      {
        title: 'Ectoin® 0,5 % & Vitamine E 0,1 %',
        body: 'Molécule qui retient l’eau en surface pour maintenir une hydratation optimale tout au long de la journée.'
      }
    ],
    synergy: {
      lead: 'Synergie Trio Anti Aging :',
      body: 'Associé aux crèmes Anti Aging Day & Night, ce trio vous fait économiser 23 € sur l’achat séparé.',
      linkId: 'trio-pack-anti-aging-serum-creme-jour-creme-nuit',
      linkLabel: 'Voir le Trio Pack'
    },
    passport: {
      volume: '30 ml',
      pack: 'Flacon compte-gouttes',
      note: 'Le flacon compte-gouttes dose quelques gouttes avant votre crème habituelle tout en préservant l’intégrité du sérum.',
      baseDays: 60
    }
  },
  'creme-silk-effect': {
    code: 'RÉF · CSK-SLK-02',
    format: 'FLACON AIRLESS · 50 ML',
    sub: 'Effet tenseur immédiat · Visage, cou et décolleté',
    order: 'ÉTAPE 03 · MATIN ET/OU SOIR',
    bars: [
      { label: 'DMAE naturel hydrosoluble', pct: '5,0 %', w: 82 },
      { label: 'Glycérol hydratant', pct: '5,0 %', w: 82 },
      { label: 'Acide thioctique', pct: '0,7 %', w: 36 },
      { label: 'Vitamine C stable', pct: '0,6 %', w: 32 }
    ],
    details: [
      {
        title: 'DMAE 5 % — Tonus et fermeté',
        body: 'Ingrédient biologique d’origine naturelle qui tonifie le derme avec un effet liftant immédiat sur visage, cou et décolleté.'
      },
      {
        title: 'Vitamine C stable 0,6 % & Acide thioctique 0,7 %',
        body: 'Action antioxydante qui ravive l’éclat du teint et combat les radicaux libres.'
      },
      {
        title: 'Glycérol 5 % & Vitamine E — Confort immédiat',
        body: 'Apportent une hydratation intense adaptée même aux peaux sèches et matures.'
      }
    ],
    synergy: {
      lead: 'Geste complémentaire :',
      body: 'Appliquer matin et/ou soir après le Sérum Age Plus sur le visage, le cou et le décolleté.',
      linkId: 'serum-age-plus-1',
      linkLabel: 'Voir le Sérum Age Plus'
    },
    passport: {
      volume: '50 ml',
      pack: 'Flacon Airless opaque',
      note: 'Le flacon Airless protège la vitamine C stable et les antioxydants de l’air et de la lumière jusqu’à la dernière pression.',
      baseDays: 80
    }
  },
  'lait-nettoyant-hydratant': {
    code: 'RÉF · CSK-LNH-03',
    format: 'FLACON · 200 ML',
    sub: '27 % d’actifs nourrissants, hydratants et apaisants',
    order: 'ÉTAPE 01 · NETTOYER',
    bars: [
      { label: 'Huile d’amande douce', pct: '10,0 %', w: 88 },
      { label: 'Émollients à chaîne moyenne', pct: '6,0 %', w: 66 },
      { label: 'Glycérine hydratante', pct: '5,0 %', w: 58 },
      { label: 'Extraits d’avoine', pct: '3,0 %', w: 42 },
      { label: 'Camomille calmante', pct: '3,0 %', w: 42 }
    ],
    details: [
      {
        title: 'Huile d’amande douce 10 % & Émollients 6 %',
        body: 'Éliminent impuretés et résidus en douceur tout en laissant une texture soyeuse.'
      },
      {
        title: 'Glycérine 5 % — Hydratation du microbiote',
        body: 'Préserve le film hydrolipidique et laisse la peau souple, hydratée et fraîche.'
      },
      {
        title: 'Avoine 3 % & Camomille 3 %',
        body: 'Duo végétal apaisant et calmant respectant l’équilibre des peaux délicates.'
      }
    ],
    synergy: {
      lead: 'Première étape de douceur :',
      body: 'Prépare la peau propre avant d’appliquer votre sérum ou votre soin quotidien.',
      linkId: 'serum-age-plus-1',
      linkLabel: 'Voir le Sérum Age Plus'
    },
    passport: {
      volume: '200 ml',
      pack: 'Flacon généreux 200 ml',
      note: 'Format 200 ml conçu pour masser une noix de lait en mouvements circulaires avant d’essuyer au coton doux.',
      baseDays: 100
    }
  },
  'mousse-nettoyante-a-lacide-glycolique': {
    code: 'RÉF · CSK-MNG-04',
    format: 'FLACON · 150 ML',
    sub: 'Nettoyage purifiant · Peaux normales, mixtes ou grasses',
    order: 'ÉTAPE 01 · NETTOYER',
    bars: [
      { label: 'Acide glycolique', pct: '2,0 %', w: 72 },
      { label: 'Avoine apaisante', pct: '2,0 %', w: 72 },
      { label: 'Extrait de camomille', pct: '2,0 %', w: 72 }
    ],
    details: [
      {
        title: 'Acide glycolique 2 % — Nettoyage & fraîcheur',
        body: 'Élimine impuretés, cellules mortes et excès de sébum sans altérer le film hydrolipidique.'
      },
      {
        title: 'Exfoliation douce optionnelle',
        body: 'Peut s’utiliser en pause de 2 minutes sur visage humidifié avant un rinçage abondant à l’eau.'
      },
      {
        title: 'Avoine 2 % & Camomille 2 %',
        body: 'Atténuent l’inconfort et procurent de la fraîcheur sans irriter la peau.'
      }
    ],
    synergy: {
      lead: 'Pack Peaux Mixtes :',
      body: 'Associée à la Crème Acide Glycolique 8 %, cette mousse forme un coffret complet avec 12 € d’économie.',
      linkId: 'pack-peaux-sensibles-mixtes-a-grasses-nettoyant-creme-acide-glycolique',
      linkLabel: 'Voir le Pack Purifiant'
    },
    passport: {
      volume: '150 ml',
      pack: 'Flacon pompe 150 ml',
      note: 'Formule mousse légère de 150 ml adaptée aux peaux normales, mixtes ou grasses pour réduire la brillance excessive.',
      baseDays: 90
    }
  },
  'creme-anti-aging-plus-day': {
    code: 'RÉF · CSK-AAD-05',
    format: 'FLACON · 50 ML',
    sub: 'Soin de jour nourrissant · Peaux normales à très sèches',
    order: 'ÉTAPE 03 · MATIN (+ SPF 30)',
    bars: [
      { label: 'Hamamélis naturel', pct: '10,0 %', w: 90 },
      { label: 'Isoflavones liposomales', pct: '5,0 %', w: 68 },
      { label: 'Matrixyl 3000® (Peptides)', pct: '3,0 %', w: 54 },
      { label: 'Bisabolol & Glycyrrhizate', pct: '1,0 %', w: 36 },
      { label: 'Rétinol huileux', pct: '0,30 %', w: 28 },
      { label: 'SOD & Coenzyme Q-10', pct: '0,25 % / 0,10 %', w: 22 }
    ],
    details: [
      {
        title: 'Rétinol huileux 0,30 % & Isoflavones liposomales 5 %',
        body: 'Contribuent à atténuer la profondeur des rides tout en repulpant et redensifiant la peau.'
      },
      {
        title: 'Matrixyl 3000® 3 % & Hamamélis 10 %',
        body: 'Soutiennent l’architecture du derme et affinent l’aspect des pores.'
      },
      {
        title: 'SOD 0,25 %, Coenzyme Q-10 0,10 % & Bisabolol 1 %',
        body: 'Aident à neutraliser le stress oxydatif ; compléter impérativement par une protection solaire SPF 30 le matin.'
      }
    ],
    synergy: {
      lead: 'Duo Day & Night :',
      body: 'Associée à la Crème Anti Aging Night, cette synergie jour & nuit vous fait économiser 25 €.',
      linkId: 'duo-pack-anti-aging-day-night',
      linkLabel: 'Voir le Duo Day & Night'
    },
    passport: {
      volume: '50 ml',
      pack: 'Flacon 50 ml · Jour',
      note: 'Ce soin de jour au rétinol huileux 0,30 % s’applique le matin sur visage et cou avant une protection SPF 30 minimum.',
      baseDays: 80
    }
  },
  'creme-anti-aging-plus-night': {
    code: 'RÉF · CSK-AAN-06',
    format: 'FLACON AIRLESS · 50 ML',
    sub: 'Dix actifs anti-âge en synergie nocturne',
    order: 'ÉTAPE 03 · SOIR PROGRESSIF',
    bars: [
      { label: 'Tenseur végétal', pct: '10,0 %', w: 92 },
      { label: 'Hamamélis', pct: '7,0 %', w: 76 },
      { label: 'Céramides actifs', pct: '5,0 %', w: 66 },
      { label: 'Phytoprotéoglycanes & Isoflavones', pct: '5,0 %', w: 66 },
      { label: 'Matrixyl 3000 (Peptides)', pct: '3,0 %', w: 50 },
      { label: 'Alpha-bisabolol', pct: '1,0 %', w: 34 },
      { label: 'Rétinol huileux', pct: '0,30 %', w: 28 }
    ],
    details: [
      {
        title: 'Rétinol huileux 0,30 % — Introduction progressive',
        body: 'À appliquer le soir sur visage propre ; déconseillé aux peaux les plus sensibles et pendant la grossesse.'
      },
      {
        title: 'Céramides actifs 5 % & Alpha-bisabolol 1 %',
        body: 'Soutiennent la barrière lipidique et apaisent la peau pendant le renouvellement nocturne.'
      },
      {
        title: 'Tenseur végétal 10 %, Matrixyl 3000 3 % & Isoflavones 5 %',
        body: 'Ciblent la fermeté, l’élasticité et le lissage du grain de peau nuit après nuit.'
      }
    ],
    synergy: {
      lead: 'Duo Day & Night :',
      body: 'Complète la Crème Anti Aging Day pour une routine 24h avec 25 € d’économie immédiate.',
      linkId: 'duo-pack-anti-aging-day-night',
      linkLabel: 'Voir le Duo Day & Night'
    },
    passport: {
      volume: '50 ml',
      pack: 'Flacon Airless opaque',
      note: 'Le système Airless isole le rétinol huileux 0,30 % de l’air et facilite un dosage régulier en initiation progressive.',
      baseDays: 80
    }
  },
  'creme-facial-acide-glycolique': {
    code: 'RÉF · CSK-GLY-07',
    format: 'FLACON AIRLESS · 50 ML',
    sub: 'Acide glycolique 8 % AHA & Aloe vera apaisant 15 %',
    order: 'ÉTAPE 03 · 1 À 2 FOIS / JOUR',
    bars: [
      { label: 'Aloe vera apaisant', pct: '15,0 %', w: 94 },
      { label: 'Acide glycolique (AHA)', pct: '8,0 %', w: 76 },
      { label: 'Mimosa & Facteur hydratant (NMF)', pct: '5,0 %', w: 58 },
      { label: 'Huile de rose musquée', pct: '2,0 %', w: 36 },
      { label: 'Alpha-bisabolol', pct: '0,5 %', w: 22 }
    ],
    details: [
      {
        title: 'Acide glycolique 8 % — Grain de peau & éclat',
        body: 'Exfoliant AHA qui régénère, lisse les ridules et ravive les teints ternes ou sujets aux taches.'
      },
      {
        title: 'Aloe vera 15 % & Facteur d’hydratation naturelle 5 %',
        body: 'Hydrate en profondeur et calme pour équilibrer l’action exfoliante.'
      },
      {
        title: 'Rose musquée 2 %, Mimosa 5 % & Bisabolol 0,5 %',
        body: 'Apporte confort et souplesse ; appliquer 1 à 2 fois par jour selon la sensibilité cutanée.'
      }
    ],
    synergy: {
      lead: 'Pack Peaux Mixtes :',
      body: 'Associée à la Mousse Glycolique 2 %, économisez 12 € sur cette routine éclat complète.',
      linkId: 'pack-peaux-sensibles-mixtes-a-grasses-nettoyant-creme-acide-glycolique',
      linkLabel: 'Voir le Pack Purifiant'
    },
    passport: {
      volume: '50 ml',
      pack: 'Flacon Airless opaque',
      note: 'Le flacon Airless préserve la stabilité de l’acide glycolique 8 % et évite toute oxydation de l’huile de rose musquée.',
      baseDays: 80
    }
  },
  'creme-raffermissante-pour-le-corps': {
    code: 'RÉF · CSK-CRP-08',
    format: 'FLACON CORPS · 200 ML',
    sub: 'Soin fermeté corps · Collagène, élastine & actifs botaniques',
    order: 'RITUEL CORPS · MATIN & SOIR',
    bars: [
      { label: 'Huile d’amande douce', pct: '10,0 %', w: 90 },
      { label: 'Huile de germe de blé & Avoine', pct: '5,0 %', w: 68 },
      { label: 'Élastine & Urée hydratante', pct: '3,0 %', w: 52 },
      { label: 'Centella Asiatica, Lierre & Ginseng', pct: '2,0 %', w: 42 },
      { label: 'Dexpanthénol, Glycérol & Mimosa', pct: '2,0 %', w: 42 },
      { label: 'Collagène & DMAE', pct: '0,5 %', w: 24 }
    ],
    details: [
      {
        title: 'Élastine 3 %, Collagène 0,5 % & DMAE 0,5 %',
        body: 'Soutiennent la structure et le tonus des zones sujettes au relâchement cutané corporel.'
      },
      {
        title: 'Huile d’amande 10 %, Urée 3 % & Avoine 5 %',
        body: 'Nourrissent intensément et lissent l’épiderme avec un confort souple.'
      },
      {
        title: 'Centella Asiatica, Lierre & Ginseng (2 %)',
        body: 'Extrait végétal tonifiant et drainant à appliquer deux fois par jour par massages délicats.'
      }
    ],
    synergy: {
      lead: 'Duo Corps Remodelant :',
      body: 'Associée à la Crème Anti Cellulite dans le Duo Corps, économisez 9 € sur les deux soins 200 ml.',
      linkId: 'duo-pack-remodelant-et-raffermissant',
      linkLabel: 'Voir le Duo Corps'
    },
    passport: {
      volume: '200 ml',
      pack: 'Flacon corps 200 ml',
      note: 'Format corps généreux de 200 ml pensé pour le massage régulier matin et soir des zones ciblées.',
      baseDays: 40
    }
  },
  'creme-anti-cellulite': {
    code: 'RÉF · CSK-CAC-09',
    format: 'FLACON CORPS · 200 ML',
    sub: 'Synergie drainante à la caféine, L-carnitine & extraits marins',
    order: 'RITUEL CORPS · MASSAGE CIRCULAIRE',
    bars: [
      { label: 'Ruscus tonifiant', pct: '2,0 %', w: 84 },
      { label: 'Fucus drainant', pct: '2,0 %', w: 84 },
      { label: 'Lierre & Marron d’Inde', pct: '2,0 %', w: 84 },
      { label: 'Caféine', pct: '1,5 %', w: 68 },
      { label: 'L-Carnitine', pct: '0,5 %', w: 36 }
    ],
    details: [
      {
        title: 'Caféine 1,5 % & L-Carnitine 0,5 %',
        body: 'Actifs ciblant l’aspect peau d’orange et aidant à lisser la texture de la peau.'
      },
      {
        title: 'Ruscus 2 %, Fucus 2 %, Lierre 2 % & Marron d’Inde 2 %',
        body: 'Complexe drainant et tonifiant accompagnant le massage circulaire sans fini collant.'
      },
      {
        title: 'Précautions d’application',
        body: 'Déconseillé aux personnes sensibles à la caféine ; éviter juste après un sauna ou un gant de luffa.'
      }
    ],
    synergy: {
      lead: 'Duo Corps Remodelant :',
      body: 'Complète la Crème Corps Raffermissante dans le coffret duo avec 9 € d’économie.',
      linkId: 'duo-pack-remodelant-et-raffermissant',
      linkLabel: 'Voir le Duo Corps'
    },
    passport: {
      volume: '200 ml',
      pack: 'Flacon corps 200 ml',
      note: 'Texture fluide qui pénètre sans coller lors du massage circulaire matin ou soir.',
      baseDays: 40
    }
  },
  'pack-peaux-sensibles-mixtes-a-grasses-nettoyant-creme-acide-glycolique': {
    code: 'COFFRET · CSK-PKG-10',
    format: 'COFFRET 2 SOINS · 150 ML + 50 ML',
    sub: 'Économie immédiate de 12 € · Routine purifiante & éclat',
    order: 'RITUEL 2 ÉTAPES · PURIFIER & LISSER',
    bars: [
      { label: 'Aloe vera apaisant (Crème)', pct: '15,0 %', w: 94 },
      { label: 'Acide glycolique (Crème)', pct: '8,0 %', w: 76 },
      { label: 'Mimosa & NMF (Crème)', pct: '5,0 %', w: 58 },
      { label: 'Acide glycolique (Mousse)', pct: '2,0 %', w: 42 },
      { label: 'Avoine & Camomille (Mousse)', pct: '2,0 %', w: 42 }
    ],
    details: [
      {
        title: 'Étape 01 · Mousse Nettoyante Glycolique (150 ml)',
        body: 'Nettoie, régule l’excès de sébum et prépare la peau avec 2 % d’acide glycolique et d’avoine.'
      },
      {
        title: 'Étape 02 · Crème Acide Glycolique 8 % (50 ml)',
        body: 'Lisse et unifie le grain de peau tout en apaisant grâce aux 15 % d’aloe vera.'
      },
      {
        title: 'Avantage coffret officiel',
        body: 'Les deux soins complémentaires réunis à 75 € au lieu de 87 €, soit 12 € d’économie.'
      }
    ],
    synergy: {
      lead: 'Précaution d’usage :',
      body: 'Introduire la crème à 1 application par jour sur les peaux réactives et utiliser une protection solaire le matin.',
      linkId: 'creme-facial-acide-glycolique',
      linkLabel: 'Voir la Crème Glycolique'
    },
    passport: {
      volume: '150 + 50 ml',
      pack: 'Flacon mousse + Airless',
      note: 'Réunit la mousse nettoyante 150 ml et le flacon Airless 50 ml pour environ 80 jours d’utilisation quotidienne.',
      baseDays: 80
    }
  },
  'trio-pack-anti-aging-serum-creme-jour-creme-nuit': {
    code: 'COFFRET · CSK-TRI-11',
    format: 'COFFRET 3 SOINS · 30 + 2 × 50 ML',
    sub: 'Économie immédiate de 23 € · Protocole anti-âge complet',
    order: 'RITUEL 24H · CIBLER, PROTÉGER, RÉGÉNÉRER',
    bars: [
      { label: 'Tenseur végétal & Hamamélis', pct: '10,0 %', w: 92 },
      { label: 'Collagène (Sérum Age Plus)', pct: '6,0 %', w: 74 },
      { label: 'Céramides & Isoflavones', pct: '5,0 %', w: 66 },
      { label: 'Gatuline® Expression', pct: '4,0 %', w: 58 },
      { label: 'Matrixyl 3000®', pct: '3,0 %', w: 50 },
      { label: 'Acide hyaluronique & Ectoin®', pct: '0,6 % / 0,5 %', w: 32 },
      { label: 'Rétinol huileux (Jour & Nuit)', pct: '0,30 %', w: 28 }
    ],
    details: [
      {
        title: 'Cibler · Sérum Age Plus (30 ml)',
        body: 'Collagène 6 %, Gatuline® 4 %, Ectoin® 0,5 % et acide hyaluronique 0,6 % pour préparer l’épiderme.'
      },
      {
        title: 'Protéger · Crème Anti Aging Day (50 ml)',
        body: 'Matrixyl 3000 3 %, Coenzyme Q-10 et rétinol 0,30 % le matin, à compléter avec un écran SPF 30.'
      },
      {
        title: 'Régénérer · Crème Anti Aging Night (50 ml)',
        body: 'Céramides 5 %, phytoprotéoglycanes 5 % et rétinol 0,30 % en introduction progressive le soir.'
      }
    ],
    synergy: {
      lead: 'Précautions Rétinol 0,30 % :',
      body: 'Protocole complet économisant 23 € (190 € au lieu de 213 €). Introduire le soin nuit progressivement et appliquer un SPF 30 le matin.',
      linkId: 'serum-age-plus-1',
      linkLabel: 'Détail du Sérum Age Plus'
    },
    passport: {
      volume: '30 + 2×50 ml',
      pack: 'Pipette + Flacon + Airless',
      note: 'Trois contenants complémentaires offrant environ 80 jours pour les crèmes 50 ml et 60 à 80 jours selon le dosage du sérum.',
      baseDays: 80
    }
  },
  'duo-pack-anti-aging-day-night': {
    code: 'COFFRET · CSK-DUO-12',
    format: 'COFFRET 2 SOINS · 2 × 50 ML',
    sub: 'Économie immédiate de 25 € · Synergie Jour & Nuit',
    order: 'RITUEL 24H · MATIN & SOIR',
    bars: [
      { label: 'Hamamélis & Tenseur végétal', pct: '10,0 %', w: 92 },
      { label: 'Isoflavones liposomales', pct: '5,0 %', w: 68 },
      { label: 'Céramides actifs (Nuit)', pct: '5,0 %', w: 68 },
      { label: 'Matrixyl 3000® (Peptides)', pct: '3,0 %', w: 52 },
      { label: 'Bisabolol apaisant', pct: '1,0 %', w: 36 },
      { label: 'Rétinol huileux', pct: '0,30 %', w: 28 },
      { label: 'Coenzyme Q-10 (Jour)', pct: '0,10 %', w: 20 }
    ],
    details: [
      {
        title: 'Le matin · Crème Anti Aging Day (50 ml)',
        body: 'Soutient le derme et neutralise le stress oxydatif ; compléter avec un écran SPF 30 minimum.'
      },
      {
        title: 'Le soir · Crème Anti Aging Night (50 ml)',
        body: 'Associe céramides 5 %, phytoprotéoglycanes 5 % et rétinol 0,30 % en relais nocturne progressif.'
      },
      {
        title: 'Avantage du duo',
        body: '2 × 50 ml réunis à 119 € au lieu de 144 €, soit 25 € d’économie sur la routine jour & nuit.'
      }
    ],
    synergy: {
      lead: 'Aller plus loin avec le sérum :',
      body: 'Ajoutez le Sérum Age Plus avant vos crèmes pour retrouver le protocole complet du Trio Pack.',
      linkId: 'trio-pack-anti-aging-serum-creme-jour-creme-nuit',
      linkLabel: 'Voir le Trio Pack'
    },
    passport: {
      volume: '2 × 50 ml',
      pack: 'Flacon Jour + Airless Nuit',
      note: 'Deux contenants de 50 ml conçus pour se relayer matin et soir sur une cure d’environ 80 jours.',
      baseDays: 80
    }
  },
  'duo-pack-remodelant-et-raffermissant': {
    code: 'COFFRET · CSK-BDC-13',
    format: 'COFFRET CORPS · 2 × 200 ML',
    sub: 'Économie immédiate de 9 € · Double format 400 ml',
    order: 'RITUEL CORPS · DRAINER & TONIFIER',
    bars: [
      { label: 'Huile d’amande (Raffermissante)', pct: '10,0 %', w: 90 },
      { label: 'Avoine & Germe de blé', pct: '5,0 %', w: 68 },
      { label: 'Élastine & Urée', pct: '3,0 %', w: 52 },
      { label: 'Ruscus, Fucus, Lierre & Centella', pct: '2,0 %', w: 44 },
      { label: 'Caféine', pct: '1,5 %', w: 38 },
      { label: 'Collagène & L-Carnitine', pct: '0,5 %', w: 24 }
    ],
    details: [
      {
        title: 'Drainer · Crème Anti Cellulite (200 ml)',
        body: 'Caféine 1,5 %, L-Carnitine 0,5 %, ruscus et fucus pour améliorer l’aspect de la peau d’orange.'
      },
      {
        title: 'Tonifier · Crème Corps Raffermissante (200 ml)',
        body: 'Élastine 3 %, collagène 0,5 %, DMAE 0,5 % et centella asiatica pour restaurer fermeté et souplesse.'
      },
      {
        title: 'Précaution & rythme',
        body: 'Déconseillé aux personnes sensibles à la caféine et après sauna ou luffa ; 75 € au lieu de 84 € (-9 €).'
      }
    ],
    synergy: {
      lead: 'Geste corps complet :',
      body: 'Appliquer en massages circulaires de bas en haut pour associer drainage et élasticité cutanée.',
      linkId: 'creme-raffermissante-pour-le-corps',
      linkLabel: 'Voir la Crème Raffermissante'
    },
    passport: {
      volume: '2 × 200 ml',
      pack: '2 flacons corps 200 ml',
      note: 'Deux flacons corps de 200 ml (400 ml au total) pour enchaîner massage drainant et nutrition raffermissante.',
      baseDays: 40
    }
  }
};
