INCLUDE Insel Rinder
INCLUDE Insel Kirke
INCLUDE Intro
INCLUDE Outro
INCLUDE Zyklopen
INCLUDE Hades

VAR name = "Freund"
VAR spieler = "Ich"

->Spielstart

=== Map ===
*[<span class="weiter">Map</span>] #CLEAR
Vor euch seht ihr unseren Schiffsweg. Wir schifften von Insel zu Insel und hofften irgendwann wieder anzukommen. {spieler} werde euch von Insel zu Insel begleiten. Sucht euch eine Insel aus, bei welcher ich das erste unserer Abenteuer erzähle und lasst uns gemeinsam den Weg zurück nach Ithaka finden. 
//Fehler im Text, Ich-Perspektive? Spieler begleitet Odysseus

    **[Die Insel der Rinder] #CLEAR
        ->Insel_der_Rinder
    **[Die Insel Kirke] #CLEAR
        ->Insel_Kirke
    **[Die Insel des Zyklopen] #CLEAR
        ->Insel_der_Zyklopen
    **[Der Hades] #CLEAR
        ->Hades_Anfang
