
import React from 'react';
import { Controller } from 'react-hook-form';
import { FormControl, InputLabel, Grid, FormHelperText, Select, MenuItem, useTheme, alpha } from '@mui/material';

const countries = [
  'Afganistán', 'Albania', 'Alemania', 'Andorra', 'Angola', 'Antigua y Barbuda', 'Arabia Saudita', 'Argelia', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 
  'Azerbaiyán', 'Bahamas', 'Bahréin', 'Bangladés', 'Barbados', 'Belarús', 'Bélgica', 'Belice', 'Benín', 'Birmania (Myanmar)', 'Bolivia', 'Bosnia y Herzegovina', 
  'Botsuana', 'Brasil', 'Brunéi Darussalam', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Bután', 'Cabo Verde', 'Camboya', 'Camerún', 'Canadá', 'Catar', 'Chad', 'Chile', 
  'China', 'Chipre', 'Ciudad del Vaticano', 'Colombia', 'Comoras', 'Congo (República del)', 'Congo (República Democrática del)', 'Corea del Norte', 'Corea del Sur', 
  'Costa de Marfil', 'Costa Rica', 'Croacia', 'Cuba', 'Curazao', 'Dinamarca', 'Yibuti (Djibouti)', 'Dominica', 'Ecuador', 'Egipto', 'El Salvador', 'Emiratos Árabes Unidos', 
  'Eritrea', 'Eslovaquia', 'Eslovenia', 'España', 'Estados Unidos de América', 'Estonia', 'Esuatini (Eswatini)', 'Etiopía', 'Filipinas', 'Finlandia', 'Fiyi', 'Francia', 
  'Gabón', 'Gambia', 'Georgia', 'Ghana', 'Granada', 'Grecia', 'Guatemala', 'Guinea', 'Guinea-Bisáu', 'Guinea Ecuatorial', 'Guyana', 'Haití', 'Honduras', 'Hungría', 
  'India', 'Indonesia', 'Irak', 'Irán', 'Irlanda', 'Islandia', 'Islas Marshall', 'Islas Salomón', 'Israel', 'Italia', 'Jamaica', 'Japón', 'Jordania', 'Kazajistán', 
  'Kenia', 'Kirguistán', 'Kiribati', 'Kosovo', 'Kuwait', 'Laos', 'Lesoto', 'Letonia', 'Líbano', 'Liberia', 'Libia', 'Liechtenstein', 'Lituania', 'Luxemburgo', 
  'Macedonia del Norte', 'Madagascar', 'Malasia', 'Malaui', 'Maldivas', 'Malí', 'Malta', 'Marruecos', 'Mauricio', 'Mauritania', 'México', 'Micronesia', 'Moldavia', 
  'Mónaco', 'Mongolia', 'Montenegro', 'Mozambique', 'Namibia', 'Nauru', 'Nepal', 'Nicaragua', 'Níger', 'Nigeria', 'Noruega', 'Nueva Zelanda', 'Omán', 'Países Bajos', 
  'Pakistán', 'Palaos', 'Palestina', 'Panamá', 'Papúa Nueva Guinea', 'Paraguay', 'Perú', 'Polonia', 'Portugal', 'Reino Unido', 'República Centroafricana', 
  'República Checa', 'República Dominicana', 'Ruanda', 'Rumania', 'Rusia', 'Sahara Occidental', 'Samoa', 'San Cristóbal y Nieves', 'San Marino', 'San Vicente y las Granadinas', 
  'Santa Lucía', 'Santo Tomé y Príncipe', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leona', 'Singapur', 'Siria', 'Somalia', 'Sri Lanka', 'Sudáfrica', 'Sudán', 
  'Sudán del Sur', 'Suecia', 'Suiza', 'Surinam', 'Tailandia', 'Taiwán', 'Tanzania', 'Tayikistán', 'Timor Oriental', 'Togo', 'Tonga', 'Trinidad y Tobago', 'Túnez', 
  'Turkmenistán', 'Turquía', 'Ucrania', 'Uganda', 'Uruguay', 'Uzbekistán', 'Vanuatu', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabue'
].map(c => ({ value: c, label: c }));

const colombianDepartments = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Bogotá D.C.', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 
  'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 
  'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'
].map(d => ({ value: d, label: d }));

const getCitiesByDepartment = (department) => {
  const citiesByDepartment = {
    Antioquia: [
      'Cáceres', 'Caucasia', 'El Bagre', 'Nechí', 'Tarazá', 'Zaragoza', 'Caracolí', 'Maceo', 'Puerto Berrío', 'Puerto Nare', 'Puerto Triunfo', 'Yondó',
      'Amalfi', 'Anorí', 'Cisneros', 'Remedios', 'San Roque', 'Santo Domingo', 'Segovia', 'Vegachí', 'Yalí', 'Yolombó',
      'Angostura', 'Belmira', 'Briceño', 'Campamento', 'Carolina del Príncipe', 'Donmatías', 'Entrerríos', 'Gómez Plata', 'Guadalupe', 'Ituango', 
      'San Andrés de Cuerquia', 'San José de la Montaña', 'San Pedro de los Milagros', 'Santa Rosa de Osos', 'Toledo', 'Valdivia', 'Yarumal',
      'Abriaquí', 'Santa Fe de Antioquia', 'Anzá', 'Armenia', 'Buriticá', 'Caicedo', 'Cañasgordas', 'Dabeiba', 'Ebéjico', 'Frontino', 'Giraldo', 'Heliconia', 
      'Liborina', 'Olaya', 'Peque', 'Sabanalarga', 'San Jerónimo', 'Sopetrán', 'Uramita',
      'Abejorral', 'Alejandría', 'Argelia', 'El Carmen de Viboral', 'Cocorná', 'Concepción', 'El Peñol', 'El Retiro', 'El Santuario', 'Granada', 'Guarne', 'Guatapé', 
      'La Ceja', 'La Unión', 'Marinilla', 'Nariño', 'Rionegro', 'San Carlos', 'San Francisco', 'San Luis', 'San Rafael', 'San Vicente Ferrer', 'Sonsón',
      'Amagá', 'Andes', 'Angelópolis', 'Betania', 'Betulia', 'Caramanta', 'Ciudad Bolívar', 'Concordia', 'Fredonia', 'Hispania', 'Jardín', 'Jericó', 'La Pintada', 
      'Montebello', 'Pueblorrico', 'Salgar', 'Santa Bárbara', 'Támesis', 'Tarso', 'Titiribí', 'Urrao', 'Valparaíso', 'Venecia',
      'Apartadó', 'Arboletes', 'Carepa', 'Chigorodó', 'Murindó', 'Mutatá', 'Necoclí', 'San Juan de Urabá', 'San Pedro de Urabá', 'Turbo', 'Vigía del Fuerte',
      'Barbosa', 'Bello', 'Caldas', 'Copacabana', 'Envigado', 'Girardota', 'Itagüí', 'La Estrella', 'Medellín', 'Sabaneta',
    ],
    Cundinamarca: ['Agua de Dios', 'Albán', 'Anapoima', 'Anolaima', 'Apulo', 'Arbeláez', 'Beltrán', 'Bituima', 'Bojacá','Cabrera', 'Cachipay', 'Cajicá', 'Caparrapí', 
      'Cáqueza', 'Carmen de Carupa', 'Chaguaní', 'Chía', 'Chipaque', 'Choachí', 'Chocontá', 'Cogua', 'Cota', 'Cucunubá', 'El Colegio', 'El Peñón', 'El Rosal', 
      'Facatativá', 'Fómeque', 'Fosca', 'Funza', 'Fúquene', 'Fusagasugá', 'Gachalá', 'Gachancipá', 'Gachetá', 'Gama', 'Girardot', 'Granada', 'Guachetá', 'Guaduas', 
      'Guasca', 'Guataquí', 'Guatavita', 'Guayabal de Síquima', 'Guayabetal', 'Gutiérrez', 'Jerusalén', 'Junín', 'La Calera', 'La Mesa', 'La Palma', 'La Peña', 
      'La Vega', 'Lenguazaque', 'Machetá', 'Madrid', 'Manta', 'Medina', 'Mosquera', 'Nariño', 'Nemocón', 'Nilo', 'Nimaima', 'Nocaima', 'Pacho', 'Paime', 'Pandi', 
      'Paratebueno', 'Pasca', 'Puerto Salgar', 'Pulí', 'Quebradanegra', 'Quetame', 'Quipile', 'Ricaurte', 'San Antonio del Tequendama', 'San Bernardo', 'San Cayetano', 
      'San Francisco', 'San Juan de Rioseco', 'Sasaima', 'Sesquilé', 'Sibaté', 'Silvania', 'Simijaca', 'Soacha', 'Sopó', 'Subachoque', 'Suesca', 'Supatá', 'Susa', 
      'Sutatausa', 'Tabio', 'Tausa', 'Tena', 'Tenjo', 'Tibacuy', 'Tibirita', 'Tocaima', 'Tocancipá', 'Topaipí', 'Ubalá', 'Ubaque', 'Ubaté', 'Une', 'Útica', 'Venecia', 
      'Vergara', 'Vianí', 'Villagómez', 'Villapinzón', 'Villeta', 'Viotá', 'Yacopí', 'Zipacón', 'Zipaquirá'],
    Amazonas: ['Leticia'],
    Atlántico: ['Barranquilla', 'Baranoa', 'Campo de la Cruz', 'Candelaria', 'Galapa', 'Juan de Acosta', 'Luruaco', 'Malambo', 'Manatí', 'Palmar de Varela', 'Piojó', 
      'Polonuevo', 'Ponedera', 'Puerto Colombia', 'Repelón', 'Sabanagrande', 'Sabanalarga', 'Santa Lucía', 'Santo Tomás', 'Soledad', 'Suán', 'Tubará', 'Usiacurí'],
    
    'Bogotá D.C.': ['Bogotá'],
      Bolívar: ['Achí', 'Altos del Rosario', 'Arenal', 'Arjona', 'Arroyohondo', 'Barranco de Loba', 'Calamar', 'Cantagallo', 'Cartagena de Indias', 'Cicuco', 'Clemencia', 
      'Córdoba', 'El Carmen de Bolívar', 'El Guamo', 'El Peñón', 'Hatillo de Loba', 'Magangué', 'Mahates', 'Margarita', 'María La Baja', 'Montecristo', 'Morales', 
      'Norosí', 'Pinillos', 'Regidor', 'Río Viejo', 'San Cristóbal', 'San Estanislao', 'San Fernando', 'San Jacinto', 'San Jacinto del Cauca', 'San Juan Nepomuceno', 
      'San Martín de Loba', 'San Pablo', 'Santa Catalina', 'Santa Cruz de Mompox', 'Santa Rosa', 'Santa Rosa del Sur', 'Simití', 'Soplaviento', 'Talaigua Nuevo', 
      'Tiquisio', 'Turbaco', 'Turbaná', 'Villanueva', 'Zambrano'],
    Boyacá: ['Almeida', 'Aquitania', 'Arcabuco', 'Belén', 'Berbeo', 'Betéitiva', 'Boavita', 'Boyacá', 'Briceño', 'Buenavista', 'Busbanzá', 'Caldas', 'Campohermoso', 
      'Cerinza', 'Chinavita', 'Chiquinquirá', 'Chíquiza', 'Chiscas', 'Chita', 'Chitaraque', 'Chivatá', 'Chivor', 'Ciénega', 'Cómbita', 'Coper', 'Corrales', 'Covarachía', 
      'Cubará', 'Cucaita', 'Cuítiva', 'Duitama', 'El Cocuy', 'El Espino', 'Firavitoba', 'Floresta', 'Gachantivá', 'Gámeza', 'Garagoa', 'Guateque', 'Guayatá', 'Güicán', 
      'Iza', 'Jenesano', 'Jericó', 'Labranzagrande', 'La Capilla', 'La Uvita', 'La Victoria', 'Leiva', 'Macanal', 'Maripí', 'Miraflores', 'Mongua', 'Monguí', 'Moniquirá', 
      'Motavita', 'Muzo', 'Nobsa', 'Nuevo Colón', 'Oicatá', 'Otanche', 'Pachavita', 'Páez', 'Paipa', 'Pajarito', 'Panqueba', 'Pauna', 'Paya', 'Paz de Río', 'Pesca', 
      'Pisba', 'Puerto Boyacá', 'Quípama', 'Ramiriquí', 'Ráquira', 'Rondón', 'Saboyá', 'Sáchica', 'Samacá', 'San Eduardo', 'San José de Pare', 'San Luis de Gaceno', 
      'San Mateo', 'San Miguel de Sema', 'San Pablo de Borbur', 'Santa María', 'Santa Rosa de Viterbo', 'Santa Sofía', 'Santana', 'Sativanorte', 'Sativasur', 'Siachoque', 
      'Soatá', 'Socha', 'Socotá', 'Sogamoso', 'Somondoco', 'Sora', 'Soracá', 'Sotaquirá', 'Susacón', 'Sutamarchán', 'Sutatenza', 'Tasco', 'Tenza', 'Tibaná', 'Tibasosa', 
      'Tinjacá', 'Tipacoque', 'Toca', 'Togüí', 'Tópaga', 'Tota', 'Tunja', 'Tununguá', 'Turmequé', 'Tuta', 'Tutazá', 'Úmbita', 'Ventaquemada', 'Villa de Leyva', 
      'Viracachá', 'Zetaquira'],
    Caldas: ['Aguadas', 'Anserma', 'Aranzazu', 'Belalcázar', 'Chinchiná', 'Filadelfia', 'La Dorada', 'La Merced', 'Manizales', 'Manzanares', 'Marmato', 'Marquetalia', 
      'Marulanda', 'Neira', 'Norcasia', 'Pácora', 'Palestina', 'Pensilvania', 'Riosucio', 'Risaralda', 'Salamina', 'Samaná', 'San José', 'Supía', 'Victoria', 
      'Villamaría', 'Viterbo'],
    Caquetá: ['Albania', 'Belén de los Andaquíes', 'Cartagena del Chairá', 'Curillo', 'El Doncello', 'El Paujil', 'Florencia', 'La Montañita', 'Milán', 'Morelia', 
      'Puerto Rico', 'San José del Fragua', 'San Vicente del Caguán', 'Solano', 'Solita', 'Valparaíso'],
    Cauca: ['Almaguer', 'Argelia', 'Balboa', 'Bolívar', 'Buenos Aires', 'Cajibío', 'Caldono', 'Caloto', 'Corinto', 'El Tambo', 'Florencia', 'Guachené', 'Guapi', 'Inzá', 
      'Jambaló', 'La Sierra', 'La Vega', 'López de Micay', 'Mercaderes', 'Miranda', 'Morales', 'Padilla', 'Páez', 'Patía', 'Piamonte', 'Piendamó', 'Popayán', 
      'Puerto Tejada', 'Puracé', 'Rosas', 'San Sebastián', 'Santander de Quilichao', 'Santa Rosa', 'Silvia', 'Sotará', 'Suárez', 'Sucre', 'Timbío', 'Timbiquí', 'Toribío', 
      'Totoró', 'Villa Rica'],
    Cesar: ['Aguachica', 'Agustín Codazzi', 'Astrea', 'Becerril', 'Bosconia', 'Chimichagua', 'Chiriguaná', 'Curumaní', 'El Copey', 'El Paso', 'Gamarra', 'González', 
      'La Gloria', 'La Jagua de Ibirico', 'La Paz', 'Manaure', 'Pailitas', 'Pelaya', 'Pueblo Bello', 'Río de Oro', 'San Alberto', 'San Diego', 'San Martín', 'Tamalameque', 
      'Valledupar'],
    Chocó: ['Acandí', 'Alto Baudó', 'Atrato', 'Bagadó', 'Bahía Solano', 'Bajo Baudó', 'Bojayá', 'Carmen del Darién', 'Cértegui', 'Condoto', 'El Cantón de San Pablo', 
      'El Carmen de Atrato', 'El Litoral de San Juan', 'Istmina', 'Juradó', 'Lloró', 'Medio Atrato', 'Medio Baudó', 'Medio San Juan', 'Nóvita', 'Nuevo Belén de Bajirá', 
      'Nuquí', 'Quibdó', 'Río Iró', 'Río Quito', 'Riosucio', 'San José del Palmar', 'Sipí', 'Tadó', 'Unguía', 'Unión Panamericana'],
    Córdoba: ['Ayapel', 'Buenavista', 'Canalete', 'Cereté', 'Chimá', 'Chinú', 'Ciénaga de Oro', 'Cotorra', 'La Apartada', 'Lorica', 'Los Córdobas', 'Momil', 'Moñitos', 
      'Montelíbano', 'Montería', 'Planeta Rica', 'Pueblo Nuevo', 'Puerto Escondido', 'Puerto Libertador', 'Purísima', 'Sahagún', 'San Andrés de Sotavento', 'San Antero', 
      'San Bernardo del Viento', 'San Carlos', 'San José de Uré', 'San Pelayo', 'Tierralta', 'Tuchín', 'Valencia'],
    Guainía: ['Inírida', 'Barrancominas', 'Cacahual', 'La Guadalupe', 'Morichal Nuevo', 'Pana Pana', 'Puerto Colombia', 'San Felipe'],
    Guaviare: ['San José del Guaviare', 'Calamar', 'El Retorno', 'Miraflores'],
    Huila: ['Acevedo', 'Agrado', 'Aipe', 'Algeciras', 'Altamira', 'Baraya', 'Campoalegre', 'Colombia', 'Elías', 'Garzón', 'Gigante', 'Guadalupe', 'Hobo', 'Íquira', 
      'Isnos', 'La Argentina', 'La Plata', 'Nátaga', 'Neiva', 'Oporapa', 'Paicol', 'Palermo', 'Palestina', 'Pital', 'Pitalito', 'Rivera', 'Saladoblanco', 'San Agustín', 
      'Santa María', 'Suaza', 'Tarqui', 'Tello', 'Teruel', 'Tesalia', 'Timaná', 'Villavieja', 'Yaguará'],
    'La Guajira': ['Albania', 'Barrancas', 'Dibulla', 'Distracción', 'El Molino', 'Fonseca', 'Hatonuevo', 'La Jagua del Pilar', 'Maicao', 'Manaure', 'Riohacha', 
      'San Juan del Cesar', 'Uribia', 'Urumita', 'Villanueva'],
    Magdalena: ['Algarrobo', 'Aracataca', 'Ariguaní', 'Cerro de San Antonio', 'Chibolo', 'Ciénaga', 'Concordia', 'El Banco', 'El Piñón', 'El Retén', 'Fundación', 
      'Guamal', 'Nueva Granada', 'Pedraza', 'Pijiño del Carmen', 'Pivijay', 'Plato', 'Puebloviejo', 'Remolino', 'Sabanas de San Ángel', 'Salamina', 
      'San Sebastián de Buenavista', 'San Zenón', 'Santa Ana', 'Santa Bárbara de Pinto', 'Santa Marta', 'Sitionuevo', 'Tenerife', 'Zapayán', 'Zona Bananera'],
    Meta: ['Acacías', 'Barranca de Upía', 'Cabuyaro', 'Castilla la Nueva', 'Cubarral', 'Cumaral', 'El Calvario', 'El Castillo', 'El Dorado', 'Fuente de Oro', 'Granada', 
      'Guamal', 'La Macarena', 'Lejanías', 'Mapiripán', 'Mesetas', 'Puerto Concordia', 'Puerto Gaitán', 'Puerto Lleras', 'Puerto López', 'Puerto Rico', 'Restrepo', 
      'San Carlos de Guaroa', 'San Juan de Arama', 'San Juanito', 'San Martín', 'Uribe', 'Villavicencio', 'Vista Hermosa'],
    Nariño: ['Albán', 'Aldana', 'Ancuya', 'Arboleda', 'Barbacoas', 'Belén', 'Buesaco', 'Chachagüí', 'Colón', 'Consacá', 'Contadero', 'Córdoba', 'Cuaspud', 'Cumbal', 
      'Cumbitara', 'El Charco', 'El Peñol', 'El Rosario', 'El Tablón de Gómez', 'El Tambo', 'Francisco Pizarro', 'Funes', 'Guachucal', 'Guaitarilla', 'Gualmatán', 
      'Iles', 'Imués', 'Ipiales', 'La Cruz', 'La Florida', 'La Llanada', 'La Tola', 'La Unión', 'Leiva', 'Linares', 'Los Andes', 'Magüí Payán', 'Mallama', 'Mosquera', 
      'Nariño', 'Olaya Herrera', 'Ospina', 'Pasto', 'Policarpa', 'Potosí', 'Providencia', 'Puerres', 'Pupiales', 'Ricaurte', 'Roberto Payán', 'Samaniego', 'San Bernardo', 
      'San Lorenzo', 'San Pablo', 'San Pedro de Cartago', 'Sandoná', 'Santa Bárbara', 'Santacruz', 'Sapuyes', 'Taminango', 'Tangua', 'Tumaco', 'Túquerres', 'Yacuanquer'],
    'Norte de Santander': ['Ábrego', 'Arboledas', 'Bochalema', 'Bucarasica', 'Cáchira', 'Cácota', 'Chinácota', 'Chitagá', 'Convención', 'Cúcuta', 'Cucutilla', 'Duranía', 
      'El Carmen', 'El Tarra', 'El Zulia', 'Gramalote', 'Hacarí', 'Herrán', 'La Esperanza', 'La Playa de Belén', 'Labateca', 'Los Patios', 'Lourdes', 'Mutiscua', 'Ocaña', 
      'Pamplona', 'Pamplonita', 'Puerto Santander', 'Ragonvalia', 'Salazar de Las Palmas', 'San Calixto', 'San Cayetano', 'Santiago', 'Sardinata', 'Silos', 'Teorama', 
      'Tibú', 'Toledo', 'Villa Caro', 'Villa del Rosario'],
    Putumayo: ['Colón', 'Mocoa', 'Orito', 'Puerto Asís', 'Puerto Caicedo', 'Puerto Guzmán', 'Puerto Leguízamo', 'San Francisco', 'San Miguel', 'Santiago', 'Sibundoy', 
      'Valle del Guamuez', 'Villagarzón'],
    Quindío: ['Armenia', 'Buenavista', 'Calarcá', 'Circasia', 'Córdoba', 'Filandia', 'Génova', 'La Tebaida', 'Montenegro', 'Pijao', 'Quimbaya', 'Salento'],
    Risaralda: ['Apía', 'Balboa', 'Belén de Umbría', 'Dosquebradas', 'Guática', 'La Celia', 'La Virginia', 'Marsella', 'Mistrató', 'Pereira', 'Pueblo Rico', 'Quinchía', 
      'Santa Rosa de Cabal', 'Santuario'],
    'San Andrés y Providencia': ['San Andrés', 'Providencia'],
    Santander: ['Aguada', 'Albania', 'Aratoca', 'Barbosa', 'Barichara', 'Barrancabermeja', 'Betulia', 'Bolívar', 'Bucaramanga', 'Cabrera', 'California', 'Capitanejo', 
      'Carcasí', 'Cepitá', 'Cerrito', 'Charalá', 'Charta', 'Chima', 'Chipatá', 'Cimitarra', 'Concepción', 'Confines', 'Contratación', 'Coromoro', 'Curití', 
      'El Carmen de Chucurí', 'El Guacamayo', 'El Peñón', 'El Playón', 'Encino', 'Enciso', 'Floridablanca', 'Galán', 'Gámbita', 'Girón', 'Guaca', 'Guadalupe', 'Guapotá', 
      'Guavatá', 'Güepsa', 'Hato', 'Jesús María', 'Jordán', 'La Belleza', 'La Paz', 'Landázuri', 'Lebrija', 'Los Santos', 'Macaravita', 'Málaga', 'Matanza', 'Mogotes', 
      'Molagavita', 'Ocamonte', 'Oiba', 'Onzaga', 'Palmar', 'Palmas del Socorro', 'Páramo', 'Piedecuesta', 'Pinchote', 'Puente Nacional', 'Puerto Parra', 'Puerto Wilches', 
      'Rionegro', 'Sabana de Torres', 'San Andrés', 'San Benito', 'San Gil', 'San Joaquín', 'San José de Miranda', 'San Miguel', 'San Vicente de Chucurí', 'Santa Bárbara', 
      'Santa Helena del Opón', 'Simacota', 'Socorro', 'Suaita', 'Sucre', 'Suratá', 'Tona', 'Valle de San José', 'Vélez', 'Vetas', 'Villanueva', 'Zapatoca'],
    Sucre: ['Betulia', 'Buenavista', 'Caimito', 'Colosó', 'Corozal', 'Coveñas', 'Chalán', 'El Roble', 'Galeras', 'Guaranda', 'La Unión', 'Los Palmitos', 'Majagual', 
      'Morroa', 'Ovejas', 'Palmito', 'Sampués', 'San Benito Abad', 'San Juan de Betulia', 'San Marcos', 'San Onofre', 'San Pedro', 'Sincelejo', 'Sincé', 'Sucre', 'Tolú', 
      'Toluviejo'],
    Tolima: ['Alpujarra', 'Alvarado', 'Ambalema', 'Anzoátegui', 'Ataco', 'Cajamarca', 'Carmen de Apicalá', 'Casabianca', 'Chaparral', 'Coello', 'Coyaima', 'Cunday', 
      'Dolores', 'Espinal', 'Falan', 'Flandes', 'Fresno', 'Guamo', 'Herveo', 'Honda', 'Ibagué', 'Icononzo', 'Lérida', 'Libano', 'Mariquita', 'Melgar', 'Murillo', 
      'Natagaima', 'Ortega', 'Palocabildo', 'Piedras', 'Planadas', 'Prado', 'Purificación', 'Rioblanco', 'Roncesvalles', 'Rovira', 'Saldaña', 'San Antonio', 'San Luis', 
      'Santa Isabel', 'Suárez', 'Valle de San Juan', 'Venadillo', 'Villahermosa', 'Villarrica'],
    'Valle del Cauca': ['Alcalá', 'Andalucía', 'Ansermanuevo', 'Argelia', 'Bolívar', 'Buenaventura', 'Buga', 'Bugalagrande', 'Caicedonia', 'Cali', 'Calima (El Darién)', 
      'Candelaria', 'Cartago', 'Dagua', 'El Águila', 'El Cairo', 'El Cerrito', 'El Dovio', 'Florida', 'Ginebra', 'Guacarí', 'Jamundí', 'La Cumbre', 'La Unión', 
      'La Victoria', 'Obando', 'Palmira', 'Pradera', 'Restrepo', 'Riofrío', 'Roldanillo', 'San Pedro', 'Sevilla', 'Toro', 'Trujillo', 'Tuluá', 'Ulloa', 'Versalles', 
      'Vijes', 'Yotoco', 'Yumbo', 'Zarzal'],
    Vaupés: ['Carurú', 'Mitú', 'Taraira', 'Pacoa', 'Papunaua', 'Yavaraté'],
    Vichada: ['Cumaribo', 'La Primavera', 'Puerto Carreño', 'Santa Rosalía'],
  };

  return (citiesByDepartment[department] || []).map(c => ({ value: c, label: c }));
};

const getNestedError = (errors, fieldName) => {
  const fieldNames = fieldName.split('.');
  let error = errors;
  for (const name of fieldNames) {
    if (error && name in error) {
      error = error[name];
    } else {
      return undefined;
    }
  }
  return error;
};

const LocationSelector = ({ departmentLabel, cityLabel, countryLabel, control, errors, watch, setValue, showCountry = false, showDepartment = false, showCity = false, countryFieldName = "pais", 
  departmentFieldName = "departamento", cityFieldName = "ciudad", countryGridProps = { xs: 12, sm: 4 }, departmentGridProps = { xs: 12, sm: 4 }, cityGridProps = { xs: 12, sm: 4 }, countryRules = {}, departmentRules = {}, cityRules = {} }) => {
  const theme = useTheme();
  const selectedCountry = watch(countryFieldName);
  const selectedDepartment = watch(departmentFieldName);
  const currentCityValue = watch(cityFieldName);

  React.useEffect(() => {
    if (!selectedDepartment) {
      if (currentCityValue && setValue) {
        setValue(cityFieldName, "", { shouldValidate: true });
      }
      return;
    }

    const citiesForSelectedDept = getCitiesByDepartment(selectedDepartment);
    const isCityInDepartment = citiesForSelectedDept.some(city => city.value === currentCityValue);

    if (currentCityValue && !isCityInDepartment) {
      if (setValue) {
        setValue(cityFieldName, "", { shouldValidate: true });
      }
    }
  }, [selectedDepartment, currentCityValue, cityFieldName, setValue]);

  const selectSx = {
    minWidth: 250,
    width: '100%',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '& .MuiOutlinedInput-notchedOutline': {
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: `2px solid ${alpha(theme.palette.primary.main, 0.5)} !important`,
    },
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.12)',
    },
    '&.Mui-focused': {
        background: 'rgba(255, 255, 255, 0.15)',
    },
  };

  const formControlSx = {
    minWidth: 120,
    width: '100%',
    '& .MuiInputLabel-root': {
      color: 'rgba(0, 0, 0, 0.6)',
      '&.Mui-focused': {
        color: theme.palette.primary.main,
      },
    },
  }

  return (
    <>
      {showCountry && (
        <Grid item {...countryGridProps}>
          <FormControl fullWidth error={!!getNestedError(errors, countryFieldName)} sx={formControlSx}>
            <InputLabel id={`${countryFieldName}-label`}>{countryLabel || 'País'}</InputLabel>
            <Controller
              name={countryFieldName}
              control={control}
              defaultValue=""
              rules={countryRules}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId={`${countryFieldName}-label`}
                  label={countryLabel || "País"}
                  sx={selectSx}
                  autoWidth
                  MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: '#ffffff',
                        height: 250,
                      },
                    },
                  }}
                >
                  {countries.map(country => (
                    <MenuItem key={country.value} value={country.value}>{country.label}</MenuItem>
                  ))}
                </Select>
              )}
            />
            {getNestedError(errors, countryFieldName) && <FormHelperText>{getNestedError(errors, countryFieldName).message}</FormHelperText>}
          </FormControl>
        </Grid>
      )}
      {showDepartment && (
        <Grid item {...departmentGridProps}>
          <FormControl fullWidth error={!!getNestedError(errors, departmentFieldName)} sx={formControlSx}>
            <InputLabel id={`${departmentFieldName}-label`}>{departmentLabel || 'Departamento'}</InputLabel>
            <Controller
              name={departmentFieldName}
              control={control}
              defaultValue=""
              rules={departmentRules}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId={`${departmentFieldName}-label`}
                  label={departmentLabel || 'Departamento'}
                  disabled={showCountry && selectedCountry !== 'Colombia'}
                  sx={selectSx}
                  autoWidth
                  MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: '#ffffff',
                        height: 250,
                      },
                    },
                  }}
                >
                  {colombianDepartments.map(dep => (
                    <MenuItem key={dep.value} value={dep.value}>{dep.label}</MenuItem>
                  ))}
                </Select>
              )}
            />
            {getNestedError(errors, departmentFieldName) && <FormHelperText>{getNestedError(errors, departmentFieldName).message}</FormHelperText>}
          </FormControl>
        </Grid>
      )}
      {showCity && (
        <Grid item {...cityGridProps}>
          <FormControl fullWidth error={!!getNestedError(errors, cityFieldName)} sx={formControlSx}>
            <InputLabel id={`${cityFieldName}-label`}>{cityLabel || 'Ciudad'}</InputLabel>
            <Controller
              name={cityFieldName}
              control={control}
              defaultValue=""
              rules={cityRules}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId={`${cityFieldName}-label`}
                  label={cityLabel || 'Ciudad'}
                  disabled={!selectedDepartment}
                  sx={selectSx}
                  autoWidth
                  MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: '#ffffff',
                        height: 250,
                      },
                    },
                  }}
                >
                  {getCitiesByDepartment(selectedDepartment).map(city => (
                    <MenuItem key={city.value} value={city.value}>{city.label}</MenuItem>
                  ))}
                </Select>
              )}
            />
            {getNestedError(errors, cityFieldName) && <FormHelperText>{getNestedError(errors, cityFieldName).message}</FormHelperText>}
          </FormControl>
        </Grid>
      )}
    </>
  );
};

export default LocationSelector;
