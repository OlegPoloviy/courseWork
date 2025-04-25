// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (optional)
  await prisma.militaryEquipment.deleteMany({});

  // Seed data
  const militaryEquipment = [
    {
      name: 'M1A2 Abrams',
      type: 'Main Battle Tank',
      country: 'United States',
      inService: true,
      description:
        'The M1 Abrams is a third-generation American main battle tank designed by Chrysler Defense and named for General Creighton Abrams.',
      year: 1980,
      technicalSpecs:
        'Weight: 73.6 tonnes; Length: 9.77 m; Width: 3.66 m; Height: 2.44 m; Crew: 4; Main Armament: 120 mm M256 smoothbore gun; Engine: Honeywell AGT1500C multi-fuel turbine engine, 1,500 hp; Range: 426 km; Max Speed: 67 km/h (road), 40 km/h (off-road); Armor: Composite armor with depleted uranium mesh',
    },
    {
      name: 'F-35 Lightning II',
      type: 'Stealth Fighter Aircraft',
      country: 'United States',
      inService: true,
      description:
        'The Lockheed Martin F-35 Lightning II is an American family of single-seat, single-engine, all-weather stealth multirole combat aircraft.',
      year: 2015,
      technicalSpecs:
        'Length: 15.7 m; Wingspan: 10.7 m; Height: 4.36 m; Empty Weight: 13,290 kg; Max Takeoff Weight: 31,800 kg; Powerplant: Pratt & Whitney F135-PW-100 afterburning turbofan; Max Speed: Mach 1.6 (1,200 mph, 1,900 km/h); Range: 2,800 km; Service Ceiling: 15,240 m; Armament: GAU-22/A 25mm cannon, air-to-air missiles, air-to-ground missiles',
    },
    {
      name: 'T-14 Armata',
      type: 'Main Battle Tank',
      country: 'Russia',
      inService: true,
      description:
        'The T-14 Armata is a Russian main battle tank based on the Armata Universal Combat Platform.',
      year: 2015,
      technicalSpecs:
        'Weight: 55 tonnes; Length: 8.7 m; Width: 3.5 m; Height: 2.7 m; Crew: 3; Main Armament: 125 mm 2A82-1M smoothbore gun; Engine: ChTZ 12N360 (X-shaped diesel engine), 1,500–2,000 hp; Range: 500 km; Max Speed: 80 km/h (road); Armor: Malachit explosive reactive armor, active protection system',
    },
    {
      name: 'Type 99',
      type: 'Main Battle Tank',
      country: 'China',
      inService: true,
      description:
        'The Type 99 or ZTZ-99 is a Chinese third-generation main battle tank.',
      year: 2001,
      technicalSpecs:
        'Weight: 54 tonnes; Length: 7.5 m; Width: 3.5 m; Height: 2.35 m; Crew: 3; Main Armament: 125 mm smoothbore gun; Engine: 1,500 hp liquid-cooled diesel; Range: 600 km; Max Speed: 80 km/h; Armor: Composite and reactive armor',
    },
    {
      name: 'Rafale',
      type: 'Multirole Fighter Aircraft',
      country: 'France',
      inService: true,
      description:
        'The Dassault Rafale is a French twin-engine, canard delta wing, multirole fighter aircraft.',
      year: 2001,
      technicalSpecs:
        'Length: 15.3 m; Wingspan: 10.9 m; Height: 5.34 m; Empty Weight: 10,300 kg; Max Takeoff Weight: 24,500 kg; Powerplant: 2 × Snecma M88-2 turbofans; Max Speed: Mach 1.8 (1,912 km/h); Range: 3,700 km; Service Ceiling: 15,235 m; Armament: 1 × 30 mm GIAT 30 cannon, air-to-air and air-to-ground missiles',
    },
    {
      name: 'HMS Queen Elizabeth',
      type: 'Aircraft Carrier',
      country: 'United Kingdom',
      inService: true,
      description:
        'HMS Queen Elizabeth is the lead ship of the Queen Elizabeth class of aircraft carriers and the Fleet Flagship of the Royal Navy.',
      year: 2017,
      technicalSpecs:
        'Displacement: 65,000 tonnes; Length: 280 m; Beam: 73 m (flight deck), 39 m (waterline); Draft: 11 m; Power Plant: Two Rolls-Royce Marine gas turbine alternators and four diesel engines; Speed: 25+ knots; Range: 10,000 nautical miles; Complement: 679 crew, capacity for 1,600 personnel; Aircraft: Up to 40 F-35B Lightning II and Merlin helicopters',
    },
    {
      name: 'AH-64 Apache',
      type: 'Attack Helicopter',
      country: 'United States',
      inService: true,
      description:
        'The Boeing AH-64 Apache is an American twin-turboshaft attack helicopter with a tailwheel-type landing gear arrangement and a tandem cockpit for a crew of two.',
      year: 1986,
      technicalSpecs:
        'Length: 17.73 m; Rotor Diameter: 17.15 m; Height: 3.87 m; Empty Weight: 5,165 kg; Max Takeoff Weight: 10,433 kg; Powerplant: 2 × General Electric T700-GE-701C turboshaft engines; Max Speed: 293 km/h; Range: 476 km; Armament: 30 mm M230 chain gun, Hellfire missiles, air-to-air missiles, rocket pods',
    },
    {
      name: 'Leopard 2',
      type: 'Main Battle Tank',
      country: 'Germany',
      inService: true,
      description:
        'The Leopard 2 is a main battle tank developed by Krauss-Maffei in the 1970s for the West German Army.',
      year: 1979,
      technicalSpecs:
        'Weight: 62.3 tonnes; Length: 9.97 m; Width: 3.75 m; Height: 2.64 m; Crew: 4; Main Armament: 120 mm Rheinmetall L/55 smoothbore gun; Engine: MTU MB 873 Ka-501 diesel engine, 1,500 hp; Range: 450 km; Max Speed: 72 km/h; Armor: Third-generation composite armor',
    },
    {
      name: 'USS Gerald R. Ford',
      type: 'Aircraft Carrier',
      country: 'United States',
      inService: true,
      description:
        'USS Gerald R. Ford (CVN-78) is the lead ship of her class of United States Navy aircraft carriers.',
      year: 2017,
      technicalSpecs:
        'Displacement: 100,000 tonnes; Length: 337 m; Beam: 78 m (flight deck), 41 m (waterline); Draft: 12 m; Power Plant: Two A1B nuclear reactors; Speed: 30+ knots; Range: Unlimited distance for 20-25 years; Complement: 2,600 ship crew, 2,400 air wing; Aircraft: 75+ aircraft including F-35C, F/A-18E/F Super Hornets, EA-18G Growlers',
    },
    {
      name: 'Su-57',
      type: 'Stealth Fighter Aircraft',
      country: 'Russia',
      inService: true,
      description:
        'The Sukhoi Su-57 is a stealth, single-seat, twin-engine multirole fifth-generation fighter aircraft manufactured by Sukhoi.',
      year: 2020,
      technicalSpecs:
        'Length: 20.1 m; Wingspan: 14.1 m; Height: 4.6 m; Empty Weight: 18,000 kg; Max Takeoff Weight: 35,000 kg; Powerplant: 2 × Saturn AL-41F1 afterburning turbofans; Max Speed: Mach 2 (2,120 km/h); Range: 3,500 km; Service Ceiling: 20,000 m; Armament: GSh-30-1 30mm cannon, air-to-air missiles, air-to-ground missiles',
    },
    {
      name: 'Challenger 2',
      type: 'Main Battle Tank',
      country: 'United Kingdom',
      inService: true,
      description:
        'The Challenger 2 is a British main battle tank in service with the armies of the United Kingdom and Oman.',
      year: 1998,
      technicalSpecs:
        'Weight: 62.5 tonnes; Length: 11.5 m (gun forward); Width: 3.5 m; Height: 2.49 m; Crew: 4; Main Armament: L30A1 120 mm rifled gun; Engine: Perkins CV12-6A V12 diesel engine, 1,200 hp; Range: 450 km; Max Speed: 59 km/h; Armor: Chobham/Dorchester level 2 composite armor',
    },
    {
      name: 'Type 055 destroyer',
      type: 'Guided Missile Destroyer',
      country: 'China',
      inService: true,
      description:
        "The Type 055 destroyer is a class of stealth guided missile destroyers being constructed for the Chinese People's Liberation Army Navy Surface Force.",
      year: 2018,
      technicalSpecs:
        'Displacement: 12,000-13,000 tonnes; Length: 180 m; Beam: 20 m; Draft: 6.6 m; Propulsion: COGAG, 4 gas turbines; Speed: 30+ knots; Range: 5,000 nautical miles; Armament: 112-cell VLS, 130 mm main gun, close-in weapon systems, torpedoes; Sensors: Type 346 AESA radar, integrated mast',
    },
    {
      name: 'B-2 Spirit',
      type: 'Stealth Bomber',
      country: 'United States',
      inService: true,
      description:
        'The Northrop Grumman B-2 Spirit, also known as the Stealth Bomber, is an American heavy strategic bomber with low observable stealth technology.',
      year: 1997,
      technicalSpecs:
        'Length: 21 m; Wingspan: 52.4 m; Height: 5.18 m; Empty Weight: 49,530 kg; Max Takeoff Weight: 170,600 kg; Powerplant: 4 × General Electric F118-GE-100 non-afterburning turbofans; Max Speed: 1,010 km/h; Range: 11,000 km; Service Ceiling: 15,200 m; Armament: 2 internal bays for 80 × 500 lb bombs or 16 × 2,000 lb bombs or nuclear weapons',
    },
    {
      name: 'Merkava Mk.4',
      type: 'Main Battle Tank',
      country: 'Israel',
      inService: true,
      description:
        'The Merkava is a main battle tank used by the Israel Defense Forces.',
      year: 2004,
      technicalSpecs:
        'Weight: 65 tonnes; Length: 9.04 m (hull), 7.60 m (without gun); Width: 3.72 m; Height: 2.66 m; Crew: 4; Main Armament: 120 mm MG253 smoothbore gun; Engine: 1,500 hp turbocharged diesel engine; Range: 500 km; Max Speed: 64 km/h; Armor: Composite modular armor, Trophy active protection system',
    },
    {
      name: 'S-400 Triumf',
      type: 'Surface-to-Air Missile System',
      country: 'Russia',
      inService: true,
      description:
        "The S-400 Triumf is a mobile, surface-to-air missile system developed by Russia's Almaz Central Design Bureau.",
      year: 2007,
      technicalSpecs:
        'Range: 400 km; Altitude: 30 km; Target Speed: 4,800 m/s; Deployment Time: 5-15 minutes; Missiles: 9M96E, 9M96E2, 9M338, 40N6E; Radar: 91N6E, 92N6E, 96L6E; Engagement Capacity: 72 targets simultaneously; Transport: MAZ-7910 heavy trucks; Crew: 8-12 personnel',
    },
  ];

  for (const item of militaryEquipment) {
    await prisma.militaryEquipment.create({
      data: item,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
