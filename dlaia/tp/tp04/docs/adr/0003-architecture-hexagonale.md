# 3. Architecture hexagonale

Contexte : les règles métier doivent se tester sans serveur ni base ;
l'API et le stockage sont amenés à changer.
Décision : trois couches, domaine, application, infrastructure ;
le domaine ne connaît ni FastAPI ni SQLite, les deux autres l'importent.
Statut : acceptée
Conséquences : validate_booking se teste sans base ; l'API ou le
stockage se remplace sans toucher au domaine ; un import du
domaine vers l'infrastructure est un bogue.
