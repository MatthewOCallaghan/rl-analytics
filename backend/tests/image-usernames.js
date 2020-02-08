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
    ]
}

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
        ['enovert', 'KYDwarrior', 'Kryptid.'] // misses the underscores from Kryptid___
    ],
    'standard-1': [
        ['ruiduraes22', 'jamesontour', 'MattyOCallaghan'],
        ['enovert', 'KYDwarrior', 'Kryptid.'] // misreads Kryptid___ as Kryptid.
    ]
}

module.exports = {
    correctOutput,
    googleOutput
};