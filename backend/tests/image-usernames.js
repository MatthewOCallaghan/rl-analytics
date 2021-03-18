// Correct username recognition outputs for test images
const correctOutput = {
    'full-scoreboard': [
        ['jamesontour', 'MattyOCallaghan'],
        ['AlejandroCR4', 'Pol_P11']
    ],
    'just-names-scoreboard': [
        ['jamesontour', 'MattyOCallaghan'],
        ['AlejandroCR4', 'Pol_P11']
    ],
    'no-top-team-name-scoreboard': [
        ['jamesontour', 'MattyOCallaghan'],
        ['Elexya_Dreams', 'FRX_ALPH4']
    ],
    'partial-competitive-scoreboard': [
        ['jamesontour', 'MattyOCallaghan'],
        ['XxDavid_74xX', 'XxFEL16xX']
    ],
    'skewed-scoreboard': [
        ['LOLLO57987', 'Lone_Wolf-_-R6'],
        ['jamesontour', 'MattyOCallaghan']
    ],
    'word-between-scoreboards': [
        ['MattyOCallaghan', 'jamesontour'],
        ['Kb_Lolle', 'Kb_Mazz']
    ],
    'partial-competitive-scoreboard-solo-standard': [
        ['torkar', 'Grillsalat', 'CommGunner'],
        ['MattyOCallaghan', 'TrinityAven', 'LadyOnTheLoo']
    ],
    'solo-0': [
        ['MattyOCallaghan'],
        ['Crusher0407']
    ],
    'solo-1': [
        ['MattyOCallaghan'], // misreads first [ in team abbreviation as an I
        ['Crusher0407']
    ],
    'solo-2': [
        ['MattyOCallaghan'],
        ['Crusher0407']
    ],
    'solo-3': [
        ['MattyOCallaghan'],
        ['Crusher0407']
    ],
    'solo-4': [
        ['MattyOCallaghan'],
        ['x891-Erxy']
    ],
    'solo-5': [
        ['MattyOCallaghan'],
        ['x891-Erxy']
    ],
    'solo-6': [
        ['MattyOCallaghan'],
        ['x891-Erxy']
    ],
    'solo-7': [
        ['MattyOCallaghan'],
        ['x891-Erxy']
    ],
    'solo-8': [
        ['MattyOCallaghan'],
        ['x891-Erxy']
    ],
    'solo-9': [
        ['RLSLAYZE'],
        ['MattyOCallaghan']
    ],
    'solo-10': [
        ['RLSLAYZE'],
        ['MattyOCallaghan']
    ],
    'solo-names': [
        ['MattyOCallaghan'],
        ['Crusher0407']
    ],
    'doubles-0': [
        ['jamesontour', 'MattyOCallaghan'],
        ['Darasn', 'Ivan-lp']
    ],
    'doubles-1': [
        ['Ivan-lp', 'SWIFTI23'],
        ['MattyOCallaghan', 'jamesontour']
    ],
    'doubles-2': [
        ['MattyOCallaghan', 'jamesontour'],
        ['Letonixion', 'KaBistHaltBad']
    ],
    'solo-standard-0': [
        ['CommGunner', 'Grillsalat', 'torkar'],
        ['LadyOnTheLoo', 'MattyOCallaghan', 'TrinityAven']
    ],
    'solo-standard-1': [
        ['torkar', 'Grillsalat', 'CommGunner'],
        ['MattyOCallaghan', 'TrinityAven', 'LadyOnTheLoo']
    ],
    'solo-standard-2': [
        ['Choco11ateTTV', 'EXOTiC Driftt', 'Redshiftedd'],
        ['cuflar32', 'everjan66', 'MattyOCallaghan']
    ],
    'standard-0': [
        ['ruiduraes22', 'jamesontour', 'MattyOCallaghan'],
        ['enovert', 'KYDwarrior', 'Kryptid___']
    ],
    'standard-1': [
        ['ruiduraes22', 'jamesontour', 'MattyOCallaghan'],
        ['enovert', 'KYDwarrior', 'Kryptid___']
    ],
    'standard-2': [
        ['BoobyY-_-', 'SpoKeR8', 'RiderXeno'],
        ['MattyOCallaghan', 'opring1871', 'jamesontour']
    ],
    'standard-3': [
        ['jamesontour', 'MattyOCallaghan', 'opring1871'],
        ['BoobyY-_-', 'RiderXeno', 'SpoKeR8']
    ],
    'standard-4': [
        ['opring1871', 'MattyOCallaghan', 'jamesontour'],
        ['Kyoya_RL', 'f9', 'MBY_Yarno070_X3']
    ],
    'standard-5': [
        ['jamesontour', 'opring1871', 'MattyOCallaghan'],
        ['xMadNightx', 'Xx_Bearry_xX', 'Mikado_RL']
    ],
    'standard-6': [
        ['RyRyLima17', 'Lukakouz', 'Onurrdam'],
        ['MattyOCallaghan', 'jamesontour', 'opring1871']
    ],
    'standard-7': [
        ['jamesontour', 'MattyOCallaghan', 'opring1871'],
        ['Erntedunkfest', 'CurryPeak', 'iAirDribbleRL']
    ],
    'standard-8': [
        ['Rufuz29', 'tiagooo95_19', 'nunorafa12'],
        ['jamesontour', 'MattyOCallaghan', 'opring1871']
    ],
    'standard-9': [
        ['OliViruz', 'Tiiill3y', 'scottcwhite'],
        ['MattyOCallaghan', 'jamesontour', 'opring1871']
    ],
    'standard-10': [
        ['jamesontour', 'MattyOCallaghan', 'opring1871'],
        ['BrocklesbyA', 'Skin-FluteRL', 'TSM_TomatoTown']
    ],
    'standard-12': [
        ['jamesontour', 'opring1871', 'MattyOCallaghan'],
        ['Zoko', 'JoSepH', 'Pqlottoshooter']
    ],
    'standard-13': [
        ['Bloody Max Boom', 'gib v2', 'Webberhino'],
        ['jamesontour', 'MattyOCallaghan', 'opring1871']
    ],
    'standard-14': [
        ['MattyOCallaghan', 'jamesontour', 'opring1871'],
        ['Colt-564', 'cssx1', 'xtr3me-theking']
    ],
    'standard-15': [
        ['ZaSti97', 'WaAmBoOs', 'LewisWkhm03'],
        ['jamesontour', 'MattyOCallaghan', 'opring1871']
    ],
    'standard-16': [
        ['jo-fnd_EZ', 'ugobgdu13', 'noeliive_'],
        ['jamesontour', 'opring1871', 'MattyOCallaghan']
    ],
    'standard-17': [
        ['xGloow-', 'Mr_Commander_16', 'Gravityy_Luke'],
        ['MattyOCallaghan', 'jamesontour', 'opring1871']
    ],
    'standard-18': [
        ['TomHester234', 'AJS_BCFC', 'Bristol_Bolt-'],
        ['jamesontour', 'opring1871', 'MattyOCallaghan']
    ],
    'standard-19': [
        ['MattyOCallaghan', 'jamesontour', 'opring1871'],
        ['Naziparaesto', 'Jmeda__', 'nicoabet71119']
    ],
    'standard-20': [
        ['jamesontour', 'MattyOCallaghan', 'opring1871'],
        ['AtOMiK-Flavix-_-', 'iSmxshGod', 'YeeZyViiRus']
    ],
    'standard-21': [
        ['jamesontour', 'MattyOCallaghan', 'opring1871'],
        ['ialeale7', 'Medico_001', 'teoiale97']
    ],
    'standard-22': [
        ['jamesontour', 'MattyOCallaghan', 'opring1871'],
        ['The-_Ghost_SkY_-', 'KimSantosa', 'moisescano23']
    ],
    'standard-23': [
        ['mycrush_bebesita', 'DeivixZz', 'Mr_RealSalchi08'],
        ['jamesontour', 'MattyOCallaghan', 'opring1871']
    ],
    'standard-24': [
        ['jamesontour', 'MattyOCallaghan', 'opring1871'],
        ['Charliee96', 'Jaylo111', 'Jhs579']
    ],
    'standard-25': [
        ['jamesontour', 'MattyOCallaghan', 'opring1871'],
        ['Boboliek', 'Kxnann', 'Semkee043']
    ]
}

// Expected output for username recognition algorithm, taking into account Google Vision misreads
// This is used to purely test my algorithm and not Google Vision
const googleOutput = {
    'full-scoreboard': [
        ['jamesontour', 'MattyOCallaghan'],
        ['AlejandroCR4', 'POLP11'] // misreads Pol_P11 as POLP11
    ],
    'just-names-scoreboard': [
        ['jamesontour', 'MattyOCallaghan'],
        ['AlejandroCR4', 'POLP11'] // misreads Pol_P11 as POLP11
    ],
    'partial-competitive-scoreboard': [
        ['jamesontour', 'MattyOCallaghan'],
        ['XxDavid_74xX', 'XXFEL16×X'] // misreads XxFEL16xX as XXFEL16×X - maybe consider replacing all × with x
    ],
    'skewed-scoreboard': [
        ['LOLLO57987', 'Lone_Wolf--R6'], // misreads Lone_Wolf-_-R6 as Lone_Wolf--R6
        ['jamesontour', 'MattyOCallaghan']
    ],
    'solo-0': [
        ['Matty0Callaghan'], // misreads MattyOCallaghan as Matty0Callaghan
        ['Crusher0407']
    ],
    'solo-4': [
        ['Matty0Callaghan'], // misreads MattyOCallaghan as Matty0Callaghan
        ['x891-Erxy']
    ],
    'solo-10': [
        ['LRLSLAYZE'], // appears to interpret avatar as containing an L and combines that with name as one word
        ['MattyOCallaghan']
    ],
    'doubles-1': [
        ['Ivan-lp', 'SWIFT|23'], // misreads SWIFTI23 as SWIFT|23
        ['MattyOCallaghan', 'jamesontour']
    ],
    'solo-standard-1': [
        ['torkar', 'Grillsalat', 'CommGunner'],
        ['Matty0Callaghan', 'TrinityAven', 'LadyOnTheLoo'] // misreads MattyOCallaghan as Matty0Callaghan
    ],
    'solo-standard-2': [
        ['Choco11ateTTV', 'EXOTIC Driftt', 'Redshiftedd'], // misreads EXOTic as EXOTIC
        ['cuflar32', 'everjan66', 'MattyOCallaghan']
    ],
    'standard-0': [
        ['ruiduraes22', 'jamesontour', 'MattyOCallaghan'],
        ['enovert', 'KYDwarrior', 'Kryptid'] // misses the underscores from Kryptid___
    ],
    'standard-1': [
        ['ruiduraes22', 'jamesontour', 'MattyOCallaghan'],
        ['enovert', 'KYDwarrior', 'Kryptid.'] // misreads Kryptid___ as Kryptid.
    ],
    'standard-4': [
        ['opring1871', 'Matty0Callaghan', 'jamesontour'], // misreads MattyOCallaghan as Matty0Callaghan
        ['Kyoya_RL', 'f9', 'MBY_Yarno070_X3']
    ],
    'standard-9': [
        ['OliViruz', 'Tiil3y', 'Scottcwhite'], // misreads Tiiill3y as Tiil3y and scottcwhite as Scottcwhite
        ['MattyOCallaghan', 'jamesontour', 'opring1871']
    ],
    'standard-12': [
        ['jamesontour', 'opring1871', 'Mattyocallaghan'], // misreads MattyOCallaghan as Mattyocallaghan
        ['Zoko', 'JoSepH', 'Pqlottoshooter']
    ],
    'standard-15': [
        ['Zasti97', 'WaAmBoOs', 'LewisWkhmØ3'], // misreads ZaSti97 as Zasti97 and LewisWkhm03 as LewisWkhmØ3
        ['jamesontour', 'MattyOCallaghan', 'opring1871']
    ],
    'standard-18': [
        ['TomHester234', 'AJS_BCFC', 'BristolBolt-'], // misreads Bristol_Bolt- as BristolBolt-
        ['jamesontour', 'opring1871', 'MattyOCallaghan']
    ],
    'standard-19': [
        ['Matty0callaghan', 'jamesontour', 'opring1871'], // misreads MattyOCallaghan as Matty0callaghan
        ['Naziparaesto', 'Jmeda__', 'nicoabet71119']
    ],
    'standard-21': [
        ['jamesontour', 'MattyOCallaghan', 'opring1871'],
        ['ialeale7', 'Medico', 'teoiale97'] // misreads Medico_001 as Medico
    ],
    'standard-22': [
        ['jamesontour', 'MattyOCallaghan', 'opring1871'],
        ['The-_Chost_SkY_-', 'KimSantosa', 'moisescano23'] // misreads The-_Ghost_SkY_- as The-_Chost_SkY_-
    ],
    'standard-23': [
        ['mycrush_bebesita', '& DeivixZz', 'Mr_RealSalchi08'], // misreads party symbol as & to get '& DeivixZz'
        ['jamesontour', 'MattyOCallaghan', 'opring1871']
    ],
    'standard-25': [
        ['jamesontour', 'MattyOCallaghan', 'opring1871'],
        ['Boboliek', 'Kxnann', '&Semkee043'] // misreads party symbol as & to get &Semkee043
    ],
}

module.exports = {
    correctOutput,
    googleOutput
};