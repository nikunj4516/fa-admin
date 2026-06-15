const placeLabels: Record<string, { gu: string; hi: string; name: string }> = {
  gandhinagar: { gu: "ગાંધીનગર", hi: "गांधीनगर", name: "Gandhinagar" },
  anand: { gu: "આણંદ", hi: "आनंद", name: "Anand" },
  rajkot: { gu: "રાજકોટ", hi: "राजकोट", name: "Rajkot" },
  mehsana: { gu: "મહેસાણા", hi: "मेहसाणा", name: "Mehsana" },
  ahmedabad: { gu: "અમદાવાદ", hi: "अहमदाबाद", name: "Ahmedabad" },
  vasad: { gu: "વાસદ", hi: "वासद", name: "Vasad" },
  gondal: { gu: "ગોંડલ", hi: "गोंडल", name: "Gondal" },
  motera: { gu: "મોટેરા", hi: "मोटेरा", name: "Motera" },
  unjha: { gu: "ઊંઝા", hi: "ऊँझा", name: "Unjha" },
  bavla: { gu: "બાવળા", hi: "बावला", name: "Bavla" }
};

export const getDistrictLabel = (district: string, language: string = "en") => {
  if (!district) return "";
  const key = district.toLowerCase().trim();
  const label = placeLabels[key];
  if (!label) return district;
  return language === "gu" ? label.gu : language === "hi" ? label.hi : label.name;
};

export const getLocationLabel = (location: string, language: string = "en") => {
  if (!location) return "";
  const key = location.toLowerCase().trim();
  const label = placeLabels[key];
  if (!label) return location;
  return language === "gu" ? label.gu : language === "hi" ? label.hi : label.name;
};
