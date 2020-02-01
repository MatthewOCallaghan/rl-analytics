const correctOutput = {
    'full-scoreboard.JPG': [
        ['jamesontour', 'MattyOCallaghan'],
        ['AlejandroCR4', 'POLP11'] // Google misreads Pol_P11 as POLP11
    ],
    'just-names-scoreboard.JPG': [
        ['jamesontour', 'MattyOCallaghan'],
        ['AlejandroCR4', 'POLP11'] // Google misreads Pol_P11 as POLP11
    ],
    'no-top-team-name-scoreboard.jpg': [
        ['jamesontour', 'MattyOCallaghan'],
        ['Elexya_Dreams', 'FRX_ALPH4']
    ],
    'partial-competitive-scoreboard.jpg': [
        ['jamesontour', 'MattyOCallaghan'],
        ['XxDavid_74xX', 'XxFEL16xX'] // Google misreads XxFEL16xX as XXFEL16×X - maybe consider replacing all × with x
    ],
    'skewed-scoreboard.JPG': [
        ['LOLLO57987', 'Lone_Wolf-_-R6'], // Google misreads Lone_Wolf-_-R6 as Lone_Wolf--R6
        ['jamesontour', 'MattyOCallaghan']
    ],
    'word-between-scoreboards.jpg': [
        ['MattyOCallaghan', 'jamesontour'],
        ['Kb_Lolle', 'Kb_Mazz']
    ]
}

module.exports = correctOutput;