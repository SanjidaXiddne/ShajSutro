export interface BangladeshLocationMap {
  [division: string]: {
    [district: string]: string[];
  };
}

export const BANGLADESH_LOCATIONS: BangladeshLocationMap = {
  Dhaka: {
    Dhaka: [
      "Dhanmondi", "Gulshan", "Banani", "Uttara", "Mirpur", "Mohammadpur",
      "Motijheel", "Tejgaon", "Ramna", "Shahbagh", "New Market", "Lalbagh",
      "Badda", "Khilgaon", "Jatrabari", "Bhashantek", "Paltan", "Savar",
      "Dhamrai", "Keraniganj", "Dohar", "Nawabganj"
    ],
    Gazipur: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Sreepur", "Kapasia"],
    Narayanganj: ["Narayanganj Sadar", "Bandar", "Araihazar", "Rupganj", "Sonargaon"],
    Narsingdi: ["Narsingdi Sadar", "Belabo", "Monohardi", "Palash", "Raipura", "Shibpur"],
    Tangail: [
      "Tangail Sadar", "Gopalpur", "Basail", "Delduar", "Ghatail", "Kalihati",
      "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Dhanbari"
    ],
    Manikganj: ["Manikganj Sadar", "Singair", "Shibalaya", "Saturia", "Harirampur", "Ghior", "Daulatpur"],
    Munshiganj: ["Munshiganj Sadar", "Tongibari", "Sreenagar", "Sirajdikhan", "Gazaria", "Louhajang"],
    Faridpur: [
      "Faridpur Sadar", "Boalmari", "Alfadanga", "Bhanga", "Nagarkanda",
      "Sadarpur", "Saltha", "Charbhadrasan", "Madhukhali"
    ],
    Gopalganj: ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"],
    Madaripur: ["Madaripur Sadar", "Kalkini", "Rajoir", "Shibchar"],
    Rajbari: ["Rajbari Sadar", "Baliakandi", "Goalandaghat", "Pangsha", "Kalukhali"],
    Shariatpur: ["Shariatpur Sadar", "Naria", "Damudya", "Gosairhat", "Janjira", "Bhedarganj"],
    Kishoreganj: [
      "Kishoreganj Sadar", "Bhairab", "Bajitpur", "Hosna", "Itna", "Karimganj",
      "Katiadi", "Kuliarchar", "Mithamain", "Nikli", "Pakundia", "Tarail"
    ],
  },
  Chattogram: {
    Chattogram: [
      "Agrabad", "Chittagong Sadar", "GEC", "Halishahar", "Khulshi", "Panchlaish",
      "Patenga", "Pahartali", "Double Mooring", "Anwara", "Banshkhali", "Boalkhali",
      "Chandanaish", "Hathazari", "Lohagara", "Mirsarai", "Patiya", "Rangunia",
      "Raozan", "Sandwip", "Satkania", "Sitakunda"
    ],
    "Cox's Bazar": ["Cox's Bazar Sadar", "Chakaria", "Maheshkhali", "Teknaf", "Ukhiya", "Kutubdia", "Pekua", "Ramu"],
    Cumilla: [
      "Cumilla Sadar", "Barura", "Brahmanpara", "Burichang", "Chandina",
      "Chauddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Muradnagar",
      "Nangalkot", "Titas"
    ],
    Feni: ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Sonagazi", "Fulgazi"],
    Noakhali: [
      "Noakhali Sadar", "Begumganj", "Chatkhil", "Companiganj", "Hatiya",
      "Senbagh", "Subarnachar", "Kabirhat"
    ],
    Brahmanbaria: [
      "Brahmanbaria Sadar", "Ashuganj", "Bancharampur", "Bijoynagar", "Kasba",
      "Nabinagar", "Nasirnagar", "Sarail"
    ],
    Chandpur: ["Chandpur Sadar", "Faridganj", "Haimchar", "Hajiganj", "Kachua", "Matlab North", "Matlab South", "Shahrasti"],
    Lakshmipur: ["Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati", "Kamalnagar"],
    Khagrachhari: ["Khagrachhari Sadar", "Dighinala", "Lakshipur", "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh"],
    Rangamati: ["Rangamati Sadar", "Belaichhari", "Barkal", "Kaptai", "Kawkhali", "Langadu", "Naniarchar", "Rajasthali"],
    Bandarban: ["Bandarban Sadar", "Alikadam", "Lama", "Naikhongchhari", "Rowangchhari", "Ruma", "Thanchi"],
  },
  Rajshahi: {
    Rajshahi: [
      "Rajshahi Sadar", "Boalia", "Motihar", "Rajputana", "Shah Mokdum", "Bagha",
      "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Tanore"
    ],
    Bogura: [
      "Bogura Sadar", "Adamdighi", "Dhunat", "Dhupchanchia", "Gabtali", "Kahaloo",
      "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatola"
    ],
    Pabna: ["Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chattmohar", "Faridpur", "Ishwardi", "Santhia", "Sujanagar"],
    Sirajganj: [
      "Sirajganj Sadar", "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur",
      "Raiganj", "Shahjadpur", "Tarash", "Ullahpara"
    ],
    Natore: ["Natore Sadar", "Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Singra", "Naldanga"],
    Naogaon: [
      "Naogaon Sadar", "Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Mahadevpur",
      "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"
    ],
    Joypurhat: ["Joypurhat Sadar", "Akkelpur", "Kalai", "Khetlal", "Panchbibi"],
    "Chapai Nawabganj": ["Chapai Nawabganj Sadar", "Bholahat", "Gomastapur", "Nachole", "Shibganj"],
  },
  Khulna: {
    Khulna: [
      "Khulna Sadar", "Daulatpur", "Khalishpur", "Khan Jahan Ali", "Sonadanga",
      "Batiaghata", "Dacope", "Dumuria", "Dighalia", "Koyra", "Paikgachha",
      "Phultala", "Rupsha", "Terokhada"
    ],
    Jeshore: ["Jeshore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"],
    Kushtia: ["Kushtia Sadar", "Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Mirpur"],
    Satkhira: ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Shyamnagar", "Tala"],
    Bagerhat: ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"],
    Jhenaidah: ["Jhenaidah Sadar", "Harinakunda", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"],
    Chuadanga: ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"],
    Meherpur: ["Meherpur Sadar", "Gangni", "Mujibnagar"],
    Magura: ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"],
    Narail: ["Narail Sadar", "Kalia", "Lohagara"],
  },
  Barishal: {
    Barishal: ["Barishal Sadar", "Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Gaurnadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur"],
    Bhola: ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"],
    Patuakhali: ["Patuakhali Sadar", "Bauphal", "Dashmina", "Galachipa", "Kalapara", "Mirzaganj", "Rangabali", "Dumki"],
    Pirojpur: ["Pirojpur Sadar", "Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Zianagar"],
    Barguna: ["Barguna Sadar", "Amatali", "Bamna", "Betagi", "Patharghata", "Taltali"],
    Jhalokati: ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"],
  },
  Sylhet: {
    Sylhet: [
      "Sylhet Sadar", "Balaganj", "Beanibazar", "Bishwanath", "Companiganj",
      "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat",
      "Osmani Nagar", "South Surma", "Zakiganj"
    ],
    Moulvibazar: ["Moulvibazar Sadar", "Barlekha", "Juri", "Kamalganj", "Kulaura", "Rajnagar", "Sreemangal"],
    Habiganj: ["Habiganj Sadar", "Ajmiriganj", "Bahubal", "Baniyachong", "Chhatak", "Chunarughat", "Lakhai", "Nabiganj", "Sayestaganj"],
    Sunamganj: [
      "Sunamganj Sadar", "Bishwamambharpur", "Chhatak", "Derai", "Dharamapasha",
      "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Tahirpur", "Shantiganj"
    ],
  },
  Rangpur: {
    Rangpur: ["Rangpur Sadar", "Badarganj", "Gangachhara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"],
    Dinajpur: [
      "Dinajpur Sadar", "Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar",
      "Phulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"
    ],
    Gaibandha: ["Gaibandha Sadar", "Fulchhari", "Gobindaganj", "Palashbari", "Sadullapur", "Sughatta", "Sundarganj"],
    Kurigram: ["Kurigram Sadar", "Bhurungamari", "Char Rajibpur", "Chilmari", "Phulbari", "Nageshwari", "Rajarhat", "Raomari", "Ulipur"],
    Nilphamari: ["Nilphamari Sadar", "Saidpur", "Jaldhaka", "Kishoreganj", "Domar", "Dimla"],
    Lalmonirhat: ["Lalmonirhat Sadar", "Aditmari", "Hatibandha", "Kaliganj", "Patgram"],
    Panchagarh: ["Panchagarh Sadar", "Atwari", "Boda", "Debi Ganj", "Tetulia"],
    Thakurgaon: ["Thakurgaon Sadar", "Baliadangi", "Haripur", "Pirganj", "Ranisankail"],
  },
  Mymensingh: {
    Mymensingh: [
      "Mymensingh Sadar", "Bhaluka", "Dhobaura", "Fulbaria", "Gafargaon",
      "Gauripur", "Haluaghat", "Ishwarganj", "Muktagachha", "Nandail",
      "Phulpur", "Trishal", "Tara Khanda"
    ],
    Jamalpur: ["Jamalpur Sadar", "Baksiganj", "Dewanganj", "Islampur", "Madarganj", "Melandaha", "Sarishabari"],
    Netrokona: [
      "Netrokona Sadar", "Atpara", "Barhatta", "Durgapur", "Kalmakanda",
      "Kendua", "Madan", "Mohanganj", "Purbadhala", "Khaliajuri"
    ],
    Sherpur: ["Sherpur Sadar", "Jhenaigati", "Nakla", "Nalitabari", "Sreebardi"],
  },
};

export const DIVISIONS = Object.keys(BANGLADESH_LOCATIONS);

export function getDistricts(division: string): string[] {
  if (!division || !BANGLADESH_LOCATIONS[division]) return [];
  return Object.keys(BANGLADESH_LOCATIONS[division]);
}

export function getThanas(division: string, district: string): string[] {
  if (!division || !district || !BANGLADESH_LOCATIONS[division]?.[district]) return [];
  return BANGLADESH_LOCATIONS[division][district];
}
