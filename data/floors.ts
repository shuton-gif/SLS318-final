export type Tier = 'vocabulary' | 'particles' | 'construction'

export type VocabFloor = {
    floor: number
    tier: 'vocabulary'
    JP: string
    EN: string
    furigana?: string
    dummies: string[]
}

export type ParticleFloor = {
    floor: number
    tier: 'particles'
    JP: string
    EN: string
    incomplete: string[]
    answer: string[]
    dummies: string[]
}

export type ConstructionFloor = {
    floor: number
    tier: 'construction'
    JP: string
    EN: string
    incomplete: string[]
    answer: string[]
    vocab_pieces: string[]
    particle_pieces: string[]
    dummies: { vocab: string[]; particle: string[] }
}

export type Floor = VocabFloor | ParticleFloor | ConstructionFloor

export const FLOORS: Floor[] = [
    {
        floor: 1, tier: 'vocabulary',
        JP: '猫', furigana: 'ねこ', EN: 'cat',
        dummies: ['犬', '猿', '鳥'],
    },
    {
        floor: 2, tier: 'vocabulary',
        JP: '犬', furigana: 'いぬ', EN: 'dog',
        dummies: ['猫', '猿', '馬'],
    },
    {
        floor: 3, tier: 'vocabulary',
        JP: '鳥', furigana: 'とり', EN: 'bird',
        dummies: ['魚', '虎', '猿'],
    },
    {
        floor: 31, tier: 'particles',
        JP: '猫のお腹はふわふわ',
        EN: "a cat's belly is super soft",
        incomplete: ['猫', '_', 'お腹', '_', 'ふわふわ'],
        answer: ['の', 'は'],
        dummies: ['を', 'が', 'に', 'で'],
    },
    {
        floor: 32, tier: 'particles',
        JP: '犬が公園で走る',
        EN: 'the dog runs in the park',
        incomplete: ['犬', '_', '公園', '_', '走る'],
        answer: ['が', 'で'],
        dummies: ['の', 'は', 'を', 'に'],
    },
    {
        floor: 33, tier: 'particles',
        JP: '鳥は空を飛ぶ',
        EN: 'the bird flies in the sky',
        incomplete: ['鳥', '_', '空', '_', '飛ぶ'],
        answer: ['は', 'を'],
        dummies: ['の', 'が', 'に', 'で'],
    },
    {
        floor: 61, tier: 'construction',
        JP: '猫は可愛いのでもふもふしたい!',
        EN: 'cats are cute, so I want to fluf them!',
        incomplete: ['_', '_', '_', '_', '_'],
        answer: ['猫', 'は', '可愛い', 'ので', 'もふもふしたい!'],
        vocab_pieces: ['猫', '可愛い', 'もふもふしたい!'],
        particle_pieces: ['は', 'ので'],
        dummies: {
            vocab: ['犬', '嬉しい', '走りたい!'],
            particle: ['を', 'が', 'から'],
        },
    },
    {
        floor: 71, tier: 'construction',
        JP: '犬と公園に行きたい',
        EN: 'I want to go to the park with my dog',
        incomplete: ['_', '_', '_', '_', '_'],
        answer: ['犬', 'と', '公園', 'に', '行きたい'],
        vocab_pieces: ['犬', '公園', '行きたい'],
        particle_pieces: ['と', 'に'],
        dummies: {
            vocab: ['猫', '学校', '帰りたい'],
            particle: ['を', 'が', 'で'],
        },
    },
    {
        floor: 81, tier: 'construction',
        JP: '鳥の歌を聞くのが好き',
        EN: 'I love listening to birds sing',
        incomplete: ['_', '_', '_', '_', '_', '_', '_'],
        answer: ['鳥', 'の', '歌', 'を', '聞く', 'のが', '好き'],
        vocab_pieces: ['鳥', '歌', '聞く', '好き'],
        particle_pieces: ['の', 'を', 'のが'],
        dummies: {
            vocab: ['猫', '声', '見る', '嫌い'],
            particle: ['は', 'が', 'に'],
        },
    },
]

export const TOTAL_FLOORS = 100

export function getFloor(n: number): Floor | undefined {
    return FLOORS.find((f) => f.floor === n)
}

export function tierForFloor(n: number): Tier {
    if (n <= 30) return 'vocabulary'
    if (n <= 60) return 'particles'
    return 'construction'
}

// Tier-3 role assignment, swapping every 10 floors starting at 61.
// 61–70: P1=vocab, P2=particle
// 71–80: P1=particle, P2=vocab
// 81–90: P1=vocab, P2=particle
// 91–100: P1=particle, P2=vocab
export type Kind = 'vocab' | 'particle'
export function getRoleAssignment(floor: number): { p1: Kind; p2: Kind } {
    const block = Math.floor((floor - 61) / 10)
    const p1IsVocab = block % 2 === 0
    return p1IsVocab ? { p1: 'vocab', p2: 'particle' } : { p1: 'particle', p2: 'vocab' }
}

export function nextFloorNumber(current: number): number | undefined {
    const idx = FLOORS.findIndex((f) => f.floor === current)
    if (idx < 0 || idx === FLOORS.length - 1) return undefined
    return FLOORS[idx + 1].floor
}
