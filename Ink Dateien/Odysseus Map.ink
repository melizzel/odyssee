
VAR name = "Freund"
VAR spieler = "Ich"

INCLUDE Intro
INCLUDE Insel Rinder
INCLUDE Insel Kirke
INCLUDE Zyklopen
INCLUDE Hades
INCLUDE Outro
INCLUDE Skylla



->Spielstart

=== Karte ===
#CLEAR
#CLEARAUDIO
#AUDIO:audio/wasser.mp3
#BACKGROUND:images/ship.svg
Vor euch seht ihr unseren Schiffsweg. Wir schifften von Insel zu Insel und hofften, irgendwann wieder anzukommen. {spieler} werde euch von Insel zu Insel begleiten. 

{Sucht euch eine Insel aus, bei welcher ich das erste unserer Abenteuer erzähle und lasst uns gemeinsam den Weg zurück nach Ithaka finden. | Sucht euch eine Insel aus, bei welcher ich das zweite unserer Abenteuer erzähle und lasst uns gemeinsam den Weg zurück nach Ithaka finden. | Sucht euch eine Insel aus, bei welcher ich das dritte unserer Abenteuer erzähle und lasst uns gemeinsam den Weg zurück nach Ithaka finden. | Sucht euch eine Insel aus, bei welcher ich das vierte unserer Abenteuer erzähle und lasst uns gemeinsam den Weg zurück nach Ithaka finden. | Sucht euch eine Insel aus, bei welcher ich das fünfte unserer Abenteuer erzähle und lasst uns gemeinsam den Weg zurück nach Ithaka finden. | Es scheint nur noch eine Insel auf unserem Weg zu liegen. Nur - wieso kommt sie mir so bekannt vor?}


    ** (Rinder) [Die Insel der Rinder] #CLEAR
        ->Insel_der_Rinder
    ** (Kirke) [Die Insel Kirke] #CLEAR
        ->Insel_Kirke
    **(Zyklop) [Die Insel des Zyklopen] #CLEAR
        ->Insel_der_Zyklopen
    **(Hades) [Der Hades] #CLEAR
        ->Hades_Anfang
    ** (Skylla){Kirke} [Die Insel der Skylla] #CLEAR
        ->Insel_Skylla   
    **{Hades} {Rinder} {Kirke} {Zyklop} {Skylla} [Ithaka?] -> Outro_Leben    
  //
  
 
