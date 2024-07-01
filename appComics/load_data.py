from django.core.management.base import BaseCommand
from appComics.models import Comic

class Command(BaseCommand):
    def handle(self, *args, **options):
        data = [
  {
    nombre: 'Batman Núm. 11',
    descripcion: '¡El Amanecer de DC sigue aquí! ¡La batalla final! ¡El enfrentamiento definitivo entre Máscara Roja y Batman culmina con un número muy especial y lleno de sorpresas!<br><br>El equipo de lujo formado por <b>Chip Zdarsky</b> y <b>Jorge Jiménez</b> (¡junto a un montón de estrellas invitadas!) homenajean al Caballero Oscuro.<br><br>¡No te lo puedes perder!',
    precio: 20000,
    stock: 25,
    foto: '/img/Pbatman.png'
  },
  {
    nombre: 'Batman: La Broma Asesina (Grandes Novelas Gráficas De Batman)',
    descripcion: 'Hay pocos enemigos tan acérrimos como Batman y el Joker. Ahora, el villano ha urdido un nuevo plan que pasa por secuestrar al comisario Gordon para humillarlo y destruirlo después de perjudicar a uno de sus seres más queridos.<br><br>¿Servirá como excusa para que el Caballero Oscuro y el Príncipe Payaso del Crimen libren la batalla final?',
    precio: 35000,
    stock: 15,
    foto: '/img/PbromaAsesina.png'
  },
  {
    nombre: 'Terror Insólito Vol. 3 De 3',
    descripcion: 'En este volumen Junji Ito despliega su maestría en la creación de ambientes, como vemos en El disco de segunda mano, uno de los favoritos del autor, donde la música se convierte en un elemento espeluznante. Otros ejemplos son La cañería gimiente, un relato que gira en torno al ruido inquietante de un desagüe, El club de los fumadores, donde el humo es algo fascinante que poco a poco se va adueñando de toda la historia, o Un laberinto insoportable, en el que la espiritualidad y la claustrofobia se unen para crear una auténtica pesadilla.',
    precio: 29990,
    stock: 10,
    foto: '/img/Pterrorinsolito.png'
  },
  {
    nombre: 'Pumpkin night Vol. 6',
    descripcion: 'Su amigo, un chico llamado Kazuya Makino, es el próximo objetivo de este misterioso asesino. Resulta que la verdadera identidad de Pumpkin Night es Naoko Kirino, una niña intimidada desde la infancia y que ha escapado de una institución mental para vengarse de sus matones.',
    precio: 10990,
    stock: 6,
    foto: '/img/pumpkin.jpg'
  },
  {
    nombre: 'Maximum Berserk 7',
    descripcion: '¡Se ha manifestado una dimensión alternativa! Un espacio que da sentido a todo lo sucedido hasta ahora, pero donde al mismo tiempo ese pasado carece de importancia. El Beherit, de nuevo en las manos de Griffith, responde a la llamada de su corazón, derrama lágrimas de sangre y arrastra a la Banda del Halcón en pleno a esa otra dimensión. Se produce entonces el advenimoiento de cuatro seres grotescos, los Mano de dios, que anuncian que Griffith se incorpora a sus filas tras una ofrenda: la vida de sus compañeros de armas. ¡Empieza el desenfrenado banquete de los demonios!',
    precio: 10990,
    stock: 7,
    foto: '/img/Pberserk.png'
  },
  {
    nombre: 'ONE PIECE EDICION 3 EN 1: PACK 1 A 5',
    descripcion: 'PACK DE LOS PRIMEROS 5 TOMOS DE ONE PIECE EDITADO POR PLANETA',
    precio: 39990,
    stock: 2,
    foto: '/img/Ponepice.png'
  },
  {
    nombre: 'JOKER: EL HOMBRE QUE RÍE (SEGUNDA EDICIÓN)',
    descripcion: '<b>Batman: The Man Who Laughs USA, Batman: Secret Files núm. 2 USA (extracto)</b><br><br> Gotham City y el atónito capitán Gordon aún se están acostumbrando a la presencia de ese nuevo justiciero llamado Batman que está limpiando la ciudad de los mafiosos que la tenían subyugada. No obstante, toda amenaza anterior va a palidecer al lado de un hombre capaz de sumir la ciudad en el pánico y el caos: el Joker.<br><br>El Hombre que ríe, escrita por Ed Brubaker (Gotham Central) y dibujada por Doug Mahnke (Green Lantern) es una de las historias más aplaudidas de la historia del Príncipe Payaso del Crimen. Este volumen también incluye un relato breve extraído de Batman Secret Files núm. 2 realizado por Andy Kubert (Damian, hijo de Batman) y Amancay Nahuelpan (Nightwing) en que el Joker se empeña en conseguir lo imposible.',
    precio: 20990,
    stock: 1,
    foto: '/img/joker_hombre_que_rie.jpg'
  },
  {
    nombre: 'JOKER: PEQUEÑAS LOCURAS',
    descripcion: '<b>Edición original: Showcase 94 núms. 1-2 (extractos), Batman: Legends of the Dark Knight núm. 200, DC First - Batgirl and The Joker USA</b> <br><br> Al Joker no le cae bien Batman. Ni Batgirl, como ha demostrado a lo largo de su larga trayectoria en las calles de Gotham City. Y además, disfruta con pequeños placeres como inocular una versión infantil de su famosa toxina mientras aguarda el comienzo de un tiroteo con la policía. O destruyendo los ordenadores de los hospitales locales. Y no nos olvidemos de todo un clásico: las bombas.<br><br>Joker: Pequeñas locuras es una antología de relatos protagonizados por el Príncipe Payaso del Crimen de la mano de autores tan destacados como James Robinson, Terry Moore, Bill Sienkiewicz o Bart Sears.<br><br>Formato: 128 páginas . A color. Cartoné<br><br>Fecha de edición: 29/03/2022',
    precio: 21990,
    stock: 12,
    foto: '/img/joker_pequeñas.jpg'
  },
  {
    nombre: 'EL BATMAN QUE RÍE (DC POCKET)',
    descripcion: '<b>he Batman Who Laughs núms. 1-7 USA, The Batman Who Laughs: The Grim Knight núm. 1 USA</b><br><br> Combinando todo lo que hace del Cruzado de la Capa un héroe y del Príncipe Payaso un asesino, el Batman que ríe es el genio criminal más peligroso del Multiverso Oscuro. Y ha llegado a Gotham a fi n de transformar el hogar de Bruce Wayne en un generador del mal. Y no viene solo. Desde otra de las realidades que integran en miríada el Multiverso Oscuro, surge el Caballero Sombrío. Ese cruel justiciero recurrirá a cualquier arma a su disposición para garantizar que sus objetivos se queden bien muertos.<br><br>Desencadenó el Multiverso Oscuro en la épica colección Noches oscuras: Metal. Ahora la superestrella Scott Snyder vuelve a unirse al aclamado dibujante Jock (Batman: Espejo oscuro) para dejar libre en Gotham City al más letal morador de esa realidad alternativa... ¡y el Caballero Oscuro original nunca volverá a ser el mismo!',
    precio: 13990,
    stock: 5,
    foto: '/img/pocket_batman.jpg'
  },
  {
    nombre: 'ERASED - BOKU DAKE GA INAI MACHI 02',
    descripcion: 'Satoru Fujinuma tiene una <b>habilidad</b> con la cual es capaz de volver en el tiempo justo antes de que algún accidente mortal ocurra para evitar que este suceda.<br><br>De forma imprevista, mediante esa habilidad sucede un efecto mayor al habitual (en lugar de unos días lo envía repentinamente dieciocho años atrás, cuando aún estaba en la primaria), dándole la oportunidad así de prevenir un <strong>secuestro</strong> que se cobró la vida de tres nenes del lugar donde vivió.<br><br>El desafío de Satoru, mucho más complejo que los que enfrentó antes, es salvar las vidas de esas chicas, especialmente de una por la que guardaba <b>mucha culpa</b>, ya que en el transcurso de su vida tuvo la oportunidad de salvarla de su fatídico destino y no lo hizo.',
    precio: 6990,
    stock: 3,
    foto: '/img/erased.jpg'
  },
  {
    nombre: 'DAREDEVIL / PUNISHER: SÉPTIMO CÍRCULO',
    descripcion: 'Un caso que aparentaba ser sencillo para Matt Murdock se complica cuando descubre que Punisher intenta impartir justicia a su particular manera. Si Daredevil y Blindspot quieren que el mafioso al que deben custodiar llegue con vida al banquillo de los acusados tendrán que utilizar toda la astucia y el ingenio del que disponen para evitar que Frank Castle no finalice esta historia de un disparo.',
    precio: 18990,
    stock: 9,
    foto: '/img/daredevil_punisher.jpg'
  }
  ,{
    nombre: '100% Marvel Punisher: El Castigador 01',
    descripcion: 'Frank... ¡Ha llegado la hora de volver al trabajo! Para Punisher, la muerte siempre ha sido algo sencillo. Las cosas se complican sólo cuando se trata de vivir. Greg Rucka (Batman) regresa a Marvel, con la misión de guiar el camino del vigilante por excelencia de La Casa de las Ideas. Punisher ha vuelto para servir a la justicia con todo lo que tiene... Pero el mundo criminal de Nueva York es más peligroso que nuncaTapa blanda con solapas, 216 páginas a color',
    precio: 22990,
    stock: 5,
    foto: '/img/punisher.jpg'
  }
  ,{
    nombre: 'MARVEL MUST-HAVE: SPIDERMAN NOIR',
    descripcion: 'Un gran poder conlleva una gran responsabilidad. Pero cuando aquellos que tienen ese poder abusan de él, el pueblo tiene la responsabilidad de derribarlos. El año es 1933. Nueva York está gobernada por políticos corruptos, policías que no hacen nada por proteger a los inocentes y hombres de negocios sin escrúpulos. Es entonces cuando una araña cambia el destino de Peter Parker, pero no es la historia que esperas. ¡Un Hombre Araña con sabor a pulp y género negro!',
    precio: 21990,
    stock: 1,
    foto: '/img/noir.jpg'
  },
  {
    nombre: '100% MARVEL HC SPIDERMAN: ¡NADA PUEDE PARAR AL JUGGERNAUT!',
    descripcion: 'En 1982, se publicó una breve historia que marcó a legiones de lectores. El Asombroso Spiderman se enfrentaba contra Juggernaut, un tradicional enemigo de La Patrulla-X que se encontraba muy por encima del tipo de amenazas a las que pudiera combatir el trepamuros. "Nada puede detener a Juggernaut" se alzó como uno de los más emocionantes y épicos momentos en la trayectoria del personaje y le unió para siempre al gigantesco villano, ocasionando sucesivos encuentros en las décadas posteriores. Este proyecto los ha reunido todos en un único y monumental volumen, que cuenta con algunos de los mejores talentos de La Casa de las Ideas y con La Patrulla-X y X-Force como invitados especiales.',
    precio: 35990,
    stock: 'Sin stock',
    foto: '/img/spiderman.jpg'
  },
  {
    nombre: 'BATMAN/FLASH: EL PRENDEDOR',
    descripcion: '<strong>BATMAN Y FLASH, EL MEJOR DETECTIVE Y EL MEJOR FORENSE DEL MUNDO, SE UNEN PARA EXPLORAR EL MISTERIO QUE HAY DETRÁS DE UN EXTRAÑO OBJETO ENCONTRADO EN LA BATCUEVA. UN MISTERIO TEJIDO A TRAVÉS DEL TIEMPO Y EL ESPACIO. UN PODER QUE AMENAZA A LOS HÉROES MÁS GRANDES DE TODOS LOS TIEMPOS. ¡EL TIEMPO CORRE PARA TODO EL UNIVERSO DC!</strong> <br><br> El especial «Universo DC: Renacimiento» marcó un antes y un después para nuestros héroes y villanos favoritos, con el regreso del Wally West original y un descubrimiento que dejó boquiabiertos a lectores de medio mundo: escondido entre las sombras de la Baticueva, el prendedor del Comediante, personaje central de Watchmen, era encontrado por un confuso Batman.<br><br> Ahora, Tom King y Joshua Williamson, arquitectos de las actuales etapas del Caballero Oscuro y del Velocista Escarlata, profundizan en el gran misterio de Renacimiento en esta esencial miniserie de cuatro números, que edtiamos para ustedes en un tomo recopilatorio en tapa blanda, que contiene todas las claves para disfrutar de todos los guiños y curiosidades de Batman/Flash: El Prendedor. ¡Con la colaboración de las estrellas del dibujo, Jason Fabok (Liga de la Justicia) y Howard Porter (JLA)!',
    precio: 14990,
    stock: 11,
    foto: '/img/prendedor.jpg'
  },
  {
    nombre: 'FLASH DE GEOFF JOHNS: IGNICIÓN',
    descripcion: 'Flash: Ignición, que recopila los números del 201 al 211 de The Flash, supuso en su día un nuevo punto de partida para Wally West de la mano de Geoff Johns (Green Lantern) y los dibujantes Alberto Dose (Desperadoes) y Howard Porter (JLA de Grant Morrison).',
    precio: 31990,
    stock: 7,
    foto: '/img/flash_ignicion.jpg'
  },
  {
    nombre: 'FLASH DE GEOFF JOHNS: LA GUERRA DE LOS VILLANOS',
    descripcion: '<b>The Flash núm. 212 a 225 USA, The Flash núm. 1/2 USA, Wonder Woman núm. 214 USA</b> <br><br> La Galería de Villanos de Flash se ha escindido en dos facciones lideradas respectivamente por el Capitán Frío y por Ola de Calor. La ruptura ha degenerado en una guerra de bandas que amenaza con destruir Keystone City. Flash se sitúa en medio para detener las hostilidades. Pero la intervención del Profesor Zoom no le va a poner las cosas fáciles.<br><br> La JSA, Green Lantern, los Jóvenes Titanes, Superman, Batman… A lo largo de su trayectoria profesional, el guionista Geoff Johns ha logrado revitalizar a algunos de los personajes más destacados de DC Comics. Como el Velocista Escarlata, de quien se encargo durante una etapa para el recuerdo que por fin vuelve a estar disponible.<br><br>Este volumen reúne los episodios 212 a 225 de The Flash junto al especial Flash 1/2 y al número 214 de Wonder Woman. En ellos, Johns se alía con los dibujantes Howard Porter, Steven Cummings, Peter Snejberg y Justiniano para animar las aventuras del héroe más veloz del Universo DC.',
    precio: 40990,
    stock: 3,
    foto: '/img/flash_la_guerra.jpg'
  },
  {
    nombre: 'GRANDES NOVELAS GRÁFICAS DC: NOCHES OSCURAS: METAL',
    descripcion: '¡Vinieron del Multiverso Oscuro! La Liga de la Justicia acaba de regresar a la Tierra tras haber derrotado a Mongul... pero ni Batman ni sus compañeros sospechan que Hawkgirl y los Blackhawks van a darles una noticia pésima: nos están invadiendo unas fuerzas malignas llegadas del reverso oscuro del Multiverso, incluido el malvado Batman Que Ríe.<br><br> Noches oscuras: Metal reúne de nuevo al guionista Scott Snyder y al dibujante Greg Capullo, responsables de la historia principal de esta exhaustiva recopilación que ofrece una experiencia completa en la que también participan Bryan Hitch, Jorge Jiménez o Jim Lee, entre otros muchos autores.',
    precio: 60990,
    stock: 1,
    foto: '/img/metal.png'
  },
  {
    nombre: 'ALL STAR SUPERMAN (4ª edición)',
    descripcion: 'Con la premisa de Superman muriéndose a causa de una sobrecarga masiva de energía solar, Grant Morrison (El Asco) y Frank Quitely (El Multiverso) narran a lo largo de este volumen las últimas semanas del Hombre de Acero. Durante este tiempo, Superman se enfrentará a dos supervivientes de Krypton, a amenazas alienígenas y, por supuesto, a Lex Luthor en una última batalla por la supervivivencia de la Tierra. Y todo esto mientras, como Clark Kent, intenta poner en orden su propia vida privada ante su inminente e irremediable muerte.<br><br>Pocas veces el título de un cómic es tan acertado como este. All-Star Superman es una historia arrebatadora en la que se dan cita "todas las estrellas" del universo de Superman para crear una aventura que aúna un guion soberbio, un dibujo fuera de serie y una épica como nunca se ha visto. ¿Logrará Superman salvar a la humanidad por última vez? ¿Y sobrevivirá él a su envenenamiento solar? Sé testigo del destino del Hombre del Mañana en uno de sus cómics más memorables.',
    precio: 39990,
    stock: 2,
    foto: '/img/superman.jpg'
  },
  {
    nombre: 'BATMAN / SUPERMAN / WONDER WOMAN: TRINIDAD',
    descripcion: 'Batman/Superman/Wonder Woman: Trinity núms. 1 a 3 (USA)¡Por primera vez, la historia de cómo el Caballero Oscuro y el Hombre de acero conocieron a la Princesa Amazona!<br><br>Ra’s al Ghul, el ecoterrorista multimillonario emprende una loca misión para rehacer el mundo a su propia imagen. Junto al clon de Superman conocido como Bizarro y una pícara y mortífera amazona de su parte, esta troika del terror arroja una sombra ominosa sobre el futuro mismo de la humanidad. ¡Se testigo del nacimiento de una alianza legendaria, de cómo Batman, Superman y Wonder Woman unen sus fuerzas para defender la Tierra contra un destino apocalíptico!<br><br> Trinidad es una impresionante visión de los años iniciales que forjaron tres verdaderas leyendas.<br><br>Escrita e ilustrada por el ganador del premio Eisner y maestro de la narración Matt Wagner (Mage, Grendel, Sandman Mystery Theatre), Trinidad cuenta con una introducción del autor número uno en ventas Brad Meltzer (The Millonaires, The Zero Game, Green Arrow, Crisis de Identidad).',
    precio: 23990,
    stock: 7,
    foto: '/img/trinidad.jpg'
  },
  {
    nombre: 'BATMAN Y SUPERMAN - COLECCIÓN NOVELAS GRÁFICAS 32: BATMAN: VICTORIA OSCURA PARTE 1',
    descripcion: 'Ya hace meses que el asesino conocido como Festivo terminó entre rejas tras poner patas arriba Gotham City. Ahora, hay una nueva fiscal del distrito que detesta a Batman. Los bajos fondos, dirigidos por la familia Falcone, se han vuelto a poner en marcha. Bruce Wayne se ha aislado de casi todo el mundo. Y por si fuera poco, hay un nuevo asesino en serie suelto por la ciudad. Y su objetivo, esta vez, es la policía local.<br><br> ¡Comienza Victoria oscura, la secuela de El largo Halloween! En 1999, el guionista Jeph Loeb y el dibujante Tim Sale se reunieron para narrar otro capítulo de los primeros años de aventuras del Caballero Oscuro y plantearon un nuevo misterio cuya primera parte podemos leer en este volumen imprescindible.',
    precio: 15990,
    stock: 6,
    foto: '/img/victoria.jpg'
  }
]

        for comic_data in data:
            Comic.objects.create(**comic_data)

        self.stdout.write(self.style.SUCCESS('Data loaded successfully'))