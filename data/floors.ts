export type Tier = 'vocabulary' | 'particles' | 'construction'

export type VocabDummyProps = {
    dummy: string
    hiragana: string
}

export type VocabFloor = {
    floor: number
    tier: 'vocabulary'
    JP: string
    EN: string
    furigana?: string
    dummies: VocabDummyProps[]
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
    // ─── Subjects (S) — floors 1–10 ───
    { floor: 1, tier: 'vocabulary', JP: '猫', furigana: 'ねこ', EN: 'cat', dummies: [{ dummy: '犬', hiragana: 'いぬ' }, { dummy: '鳥', hiragana: 'とり' }, { dummy: '馬', hiragana: 'うま' }] },
    { floor: 2, tier: 'vocabulary', JP: '犬', furigana: 'いぬ', EN: 'dog', dummies: [{ dummy: '猫', hiragana: 'ねこ' }, { dummy: '鳥', hiragana: 'とり' }, { dummy: '魚', hiragana: 'さかな' }] },
    { floor: 3, tier: 'vocabulary', JP: '鳥', furigana: 'とり', EN: 'bird', dummies: [{ dummy: '魚', hiragana: 'さかな' }, { dummy: '虎', hiragana: 'とら' }, { dummy: '猿', hiragana: 'さる' }] },
    { floor: 4, tier: 'vocabulary', JP: '馬', furigana: 'うま', EN: 'horse', dummies: [{ dummy: '牛', hiragana: 'うし' }, { dummy: '羊', hiragana: 'ひつじ' }, { dummy: '豚', hiragana: 'ぶた' }] },
    { floor: 5, tier: 'vocabulary', JP: '魚', furigana: 'さかな', EN: 'fish', dummies: [{ dummy: '鳥', hiragana: 'とり' }, { dummy: '蛇', hiragana: 'へび' }, { dummy: '蝶', hiragana: 'ちょう' }] },
    { floor: 6, tier: 'vocabulary', JP: '子供', furigana: 'こども', EN: 'child', dummies: [{ dummy: '大人', hiragana: 'おとな' }, { dummy: '学生', hiragana: 'がくせい' }, { dummy: '先生', hiragana: 'せんせい' }] },
    { floor: 7, tier: 'vocabulary', JP: '先生', furigana: 'せんせい', EN: 'teacher', dummies: [{ dummy: '学生', hiragana: 'がくせい' }, { dummy: '医者', hiragana: 'いしゃ' }, { dummy: '警官', hiragana: 'けいかん' }] },
    { floor: 8, tier: 'vocabulary', JP: '学生', furigana: 'がくせい', EN: 'student', dummies: [{ dummy: '先生', hiragana: 'せんせい' }, { dummy: '子供', hiragana: 'こども' }, { dummy: '大人', hiragana: 'おとな' }] },
    { floor: 9, tier: 'vocabulary', JP: '母', furigana: 'はは', EN: 'mother', dummies: [{ dummy: '父', hiragana: 'ちち' }, { dummy: '兄', hiragana: 'あに' }, { dummy: '姉', hiragana: 'あね' }] },
    { floor: 10, tier: 'vocabulary', JP: '父', furigana: 'ちち', EN: 'father', dummies: [{ dummy: '母', hiragana: 'はは' }, { dummy: '兄', hiragana: 'あに' }, { dummy: '姉', hiragana: 'あね' }] },

    // ─── Objects (O) — floors 11–20 ───
    { floor: 11, tier: 'vocabulary', JP: '本', furigana: 'ほん', EN: 'book', dummies: [{ dummy: '雑誌', hiragana: 'ざっし' }, { dummy: '新聞', hiragana: 'しんぶん' }, { dummy: '紙', hiragana: 'かみ' }] },
    { floor: 12, tier: 'vocabulary', JP: '水', furigana: 'みず', EN: 'water', dummies: [{ dummy: 'お茶', hiragana: 'おちゃ' }, { dummy: 'ジュース', hiragana: 'じゅーす' }, { dummy: '牛乳', hiragana: 'ぎゅうにゅう' }] },
    { floor: 13, tier: 'vocabulary', JP: '車', furigana: 'くるま', EN: 'car', dummies: [{ dummy: '自転車', hiragana: 'じてんしゃ' }, { dummy: 'バス', hiragana: 'ばす' }, { dummy: '電車', hiragana: 'でんしゃ' }] },
    { floor: 14, tier: 'vocabulary', JP: '家', furigana: 'いえ', EN: 'house', dummies: [{ dummy: '学校', hiragana: 'がっこう' }, { dummy: '病院', hiragana: 'びょういん' }, { dummy: '公園', hiragana: 'こうえん' }] },
    { floor: 15, tier: 'vocabulary', JP: '食べ物', furigana: 'たべもの', EN: 'food', dummies: [{ dummy: '飲み物', hiragana: 'のみもの' }, { dummy: 'お菓子', hiragana: 'おかし' }, { dummy: '薬', hiragana: 'くすり' }] },
    { floor: 16, tier: 'vocabulary', JP: '椅子', furigana: 'いす', EN: 'chair', dummies: [{ dummy: '机', hiragana: 'つくえ' }, { dummy: '棚', hiragana: 'たな' }, { dummy: 'ソファ', hiragana: 'そふぁ' }] },
    { floor: 17, tier: 'vocabulary', JP: '鞄', furigana: 'かばん', EN: 'bag', dummies: [{ dummy: '財布', hiragana: 'さいふ' }, { dummy: '帽子', hiragana: 'ぼうし' }, { dummy: '靴', hiragana: 'くつ' }] },
    { floor: 18, tier: 'vocabulary', JP: '傘', furigana: 'かさ', EN: 'umbrella', dummies: [{ dummy: '帽子', hiragana: 'ぼうし' }, { dummy: 'コート', hiragana: 'こーと' }, { dummy: '靴', hiragana: 'くつ' }] },
    { floor: 19, tier: 'vocabulary', JP: '鍵', furigana: 'かぎ', EN: 'key', dummies: [{ dummy: '財布', hiragana: 'さいふ' }, { dummy: '携帯', hiragana: 'けいたい' }, { dummy: '時計', hiragana: 'とけい' }] },
    { floor: 20, tier: 'vocabulary', JP: '服', furigana: 'ふく', EN: 'clothes', dummies: [{ dummy: '靴', hiragana: 'くつ' }, { dummy: '帽子', hiragana: 'ぼうし' }, { dummy: '鞄', hiragana: 'かばん' }] },

    // ─── Verbs (V) — floors 21–30 ───
    { floor: 22, tier: 'vocabulary', JP: '飲む', furigana: 'のむ', EN: 'drink', dummies: [{ dummy: '食べる', hiragana: 'たべる' }, { dummy: '嗅ぐ', hiragana: 'かぐ' }, { dummy: '噛む', hiragana: 'かむ' }] },
    { floor: 23, tier: 'vocabulary', JP: '見る', furigana: 'みる', EN: 'see', dummies: [{ dummy: '聞く', hiragana: 'きく' }, { dummy: '触る', hiragana: 'さわる' }, { dummy: '嗅ぐ', hiragana: 'かぐ' }] },
    { floor: 24, tier: 'vocabulary', JP: '行く', furigana: 'いく', EN: 'go', dummies: [{ dummy: '来る', hiragana: 'くる' }, { dummy: '帰る', hiragana: 'かえる' }, { dummy: '走る', hiragana: 'はしる' }] },
    { floor: 25, tier: 'vocabulary', JP: '帰る', furigana: 'かえる', EN: 'return', dummies: [{ dummy: '行く', hiragana: 'いく' }, { dummy: '来る', hiragana: 'くる' }, { dummy: '出る', hiragana: 'でる' }] },
    { floor: 26, tier: 'vocabulary', JP: '走る', furigana: 'はしる', EN: 'run', dummies: [{ dummy: '歩く', hiragana: 'あるく' }, { dummy: '泳ぐ', hiragana: 'およぐ' }, { dummy: '跳ぶ', hiragana: 'とぶ' }] },
    { floor: 27, tier: 'vocabulary', JP: '歩く', furigana: 'あるく', EN: 'walk', dummies: [{ dummy: '走る', hiragana: 'はしる' }, { dummy: '立つ', hiragana: 'たつ' }, { dummy: '座る', hiragana: 'すわる' }] },
    { floor: 28, tier: 'vocabulary', JP: '泳ぐ', furigana: 'およぐ', EN: 'swim', dummies: [{ dummy: '走る', hiragana: 'はしる' }, { dummy: '飛ぶ', hiragana: 'とぶ' }, { dummy: '潜る', hiragana: 'もぐる' }] },
    { floor: 29, tier: 'vocabulary', JP: '寝る', furigana: 'ねる', EN: 'sleep', dummies: [{ dummy: '起きる', hiragana: 'おきる' }, { dummy: '休む', hiragana: 'やすむ' }, { dummy: '食べる', hiragana: 'たべる' }] },
    { floor: 30, tier: 'vocabulary', JP: '起きる', furigana: 'おきる', EN: 'wake up', dummies: [{ dummy: '寝る', hiragana: 'ねる' }, { dummy: '立つ', hiragana: 'たつ' }, { dummy: '座る', hiragana: 'すわる' }] },
    // ─── Particles 31–33 — multi-particle, は/が対比の導入 ───
    {
        floor: 31, tier: 'particles',
        JP: '猫のお腹はふわふわ',
        EN: "a cat's belly is super fluffy",
        incomplete: ['猫', '_', 'お腹', '_', 'ふわふわ'],
        answer: ['の', 'は'],
        dummies: ['を', 'が', 'に', 'で'],
    },
    {
        floor: 32, tier: 'particles',
        JP: '猫はお腹がふわふわ',
        EN: "a cat has a fluffy belly",
        incomplete: ['猫', '_', 'お腹', '_', 'ふわふわ'],
        answer: ['は', 'が'],
        dummies: ['を', 'の', 'に', 'で'],
    },
    {
        floor: 33, tier: 'particles',
        JP: '鳥は空を飛ぶ生き物だ',
        EN: 'birds are creatures that fly in the sky',
        incomplete: ['鳥', '_', '空', '_', '飛ぶ', '生き物', 'だ'],
        answer: ['は', 'を'],
        dummies: ['の', 'が', 'に', 'で'],
    },

    // ─── Particles 34–40 — は vs が の対比を散りばめる ───
    {
        floor: 34, tier: 'particles', JP: '猫が寝ている', EN: 'a cat is sleeping',
        incomplete: ['猫', '_', '寝ている'], answer: ['が'], dummies: ['を', 'の', 'は', 'に']
    },

    {
        floor: 35, tier: 'particles', JP: '犬は可愛い動物だ', EN: 'dogs are cute animals',
        incomplete: ['犬', '_', '可愛い', '動物', 'だ'], answer: ['は'], dummies: ['が', 'を', 'の', 'で']
    },

    {
        floor: 36, tier: 'particles', JP: '鳥が飛んでいる', EN: 'a bird is flying',
        incomplete: ['鳥', '_', '飛んでいる'], answer: ['が'], dummies: ['を', 'の', 'は', 'と']
    },

    {
        floor: 37, tier: 'particles', JP: '魚は水の中で生きる', EN: 'fish live in the water',
        incomplete: ['魚', '_', '水', '_', '中', 'で', '生きる'], answer: ['は', 'の'], dummies: ['が', 'を', 'に', 'で']
    },

    {
        floor: 38, tier: 'particles', JP: '子供が公園で遊んでいる', EN: 'a child is playing in the park',
        incomplete: ['子供', '_', '公園', '_', '遊んでいる'], answer: ['が', 'で'], dummies: ['を', 'の', 'は', 'に']
    },

    {
        floor: 39, tier: 'particles', JP: '学生は毎日勉強する', EN: 'students study every day',
        incomplete: ['学生', '_', '毎日', '勉強する'], answer: ['は'], dummies: ['が', 'を', 'の', 'で']
    },

    {
        floor: 40, tier: 'particles', JP: '母は優しい人だ', EN: 'my mother is a kind person',
        incomplete: ['母', '_', '優しい', '人', 'だ'], answer: ['は'], dummies: ['が', 'を', 'の', 'に']
    },

    // ─── Particles 41–45 — 同じ語彙で助詞だけ違う、ニュアンス対比 ───
    {
        floor: 41, tier: 'particles',
        JP: '犬の名前はポチ',
        EN: "the dog's name is Pochi",
        incomplete: ['犬', '_', '名前', '_', 'ポチ'],
        answer: ['の', 'は'],
        dummies: ['を', 'が', 'に', 'で'],
    },
    {
        floor: 42, tier: 'particles',
        JP: 'ポチという名前の犬',
        EN: "a dog named Pochi",
        incomplete: ['ポチ', '_', '名前', '_', '犬'],
        answer: ['という', 'の'],
        dummies: ['を', 'が', 'に', 'で'],
    },
    {
        floor: 43, tier: 'particles',
        JP: '私は寿司が好き',
        EN: 'I love sushi',
        incomplete: ['私', '_', '寿司', '_', '好き'],
        answer: ['は', 'が'],
        dummies: ['を', 'の', 'に', 'で'],
    },
    {
        floor: 44, tier: 'particles',
        JP: '私の好きなものは寿司',
        EN: 'the thing I love is sushi',
        incomplete: ['私', '_', '好きな', 'もの', '_', '寿司'],
        answer: ['の', 'は'],
        dummies: ['を', 'が', 'に', 'で'],
    },
    {
        floor: 45, tier: 'particles',
        JP: '象は鼻が長い',
        EN: 'elephants have long noses',
        incomplete: ['象', '_', '鼻', '_', '長い'],
        answer: ['は', 'が'],
        dummies: ['を', 'の', 'に', 'で'],
    },

    {
        floor: 46, tier: 'particles', JP: 'ペンで書く', EN: 'write with a pen',
        incomplete: ['ペン', '_', '書く'], answer: ['で'], dummies: ['を', 'の', 'は', 'に']
    },

    {
        floor: 47, tier: 'particles', JP: '家から駅まで歩く', EN: 'walk from home to the station',
        incomplete: ['家', '_', '駅', '_', '歩く'], answer: ['から', 'まで'], dummies: ['を', 'の', 'は', 'に']
    },

    {
        floor: 48, tier: 'particles', JP: '朝ご飯を食べた', EN: 'I ate breakfast',
        incomplete: ['朝ご飯', '_', '食べた'], answer: ['を'], dummies: ['の', 'は', 'が', 'で']
    },

    {
        floor: 49, tier: 'particles', JP: '母が花を買った', EN: 'mother bought flowers',
        incomplete: ['母', '_', '花', '_', '買った'], answer: ['が', 'を'], dummies: ['の', 'は', 'に', 'で']
    },

    {
        floor: 50, tier: 'particles', JP: '犬と猫が遊んでいる', EN: 'a dog and a cat are playing',
        incomplete: ['犬', '_', '猫', '_', '遊んでいる'], answer: ['と', 'が'], dummies: ['を', 'の', 'は', 'で']
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
        JP: '今朝、犬と公園に行きたかった',
        EN: 'this morning, I wanted to go to the park with my dog',
        incomplete: ['_', '_', '_', '_', '_', '_'],
        answer: ['今朝', '犬', 'と', '公園', 'に', '行きたかった'],
        vocab_pieces: ['今朝', '犬', '公園', '行きたかった'],
        particle_pieces: ['と', 'に'],
        dummies: {
            vocab: ['昨日', '猫', '学校', '帰りたかった'],
            particle: ['を', 'が', 'で'],
        },
    },
    {
        floor: 72, tier: 'construction',
        JP: '母は本を読んでいた',
        EN: 'mother was reading a book',
        incomplete: ['_', '_', '_', '_', '_'],
        answer: ['母', 'は', '本', 'を', '読んでいた'],
        vocab_pieces: ['母', '本', '読んでいた'],
        particle_pieces: ['は', 'を'],
        dummies: {
            vocab: ['父', '雑誌', '書いていた'],
            particle: ['が', 'の', 'で'],
        },
    },
    {
        floor: 73, tier: 'construction',
        JP: '鳥が空を飛んでいた',
        EN: 'a bird was flying in the sky',
        incomplete: ['_', '_', '_', '_', '_'],
        answer: ['鳥', 'が', '空', 'を', '飛んでいた'],
        vocab_pieces: ['鳥', '空', '飛んでいた'],
        particle_pieces: ['が', 'を'],
        dummies: {
            vocab: ['魚', '海', '泳いでいた'],
            particle: ['は', 'の', 'で'],
        },
    },
    {
        floor: 74, tier: 'construction',
        JP: '子供が水を飲んでいた',
        EN: 'a child was drinking water',
        incomplete: ['_', '_', '_', '_', '_'],
        answer: ['子供', 'が', '水', 'を', '飲んでいた'],
        vocab_pieces: ['子供', '水', '飲んでいた'],
        particle_pieces: ['が', 'を'],
        dummies: {
            vocab: ['学生', 'お茶', '食べていた'],
            particle: ['は', 'の', 'に'],
        },
    },
    {
        floor: 75, tier: 'construction',
        JP: '鳥は空を飛ぶ生き物だった',
        EN: 'birds were creatures that flew in the sky',
        incomplete: ['_', '_', '_', '_', '_', '_', '_'],
        answer: ['鳥', 'は', '空', 'を', '飛ぶ', '生き物', 'だった'],
        vocab_pieces: ['鳥', '空', '飛ぶ', '生き物', 'だった'],
        particle_pieces: ['は', 'を'],
        dummies: {
            vocab: ['魚', '海', '泳ぐ', '動物', 'だ'],
            particle: ['が', 'の', 'で'],
        },
    },
    {
        floor: 81, tier: 'construction',
        JP: '学校で勉強していた学生',
        EN: 'the student who was studying at school',
        incomplete: ['_', '_', '_', '_'],
        answer: ['学校', 'で', '勉強していた', '学生'],
        vocab_pieces: ['学校', '勉強していた', '学生'],
        particle_pieces: ['で'],
        dummies: {
            vocab: ['公園', '遊んでいた', '子供'],
            particle: ['を', 'に', 'と'],
        },
    },
    {
        floor: 82, tier: 'construction',
        JP: '本を読んでいた母',
        EN: 'the mother who was reading a book',
        incomplete: ['_', '_', '_', '_'],
        answer: ['本', 'を', '読んでいた', '母'],
        vocab_pieces: ['本', '読んでいた', '母'],
        particle_pieces: ['を'],
        dummies: {
            vocab: ['雑誌', '書いていた', '父'],
            particle: ['は', 'が', 'で'],
        },
    },
    {
        floor: 83, tier: 'construction',
        JP: '空を飛んでいた鳥',
        EN: 'the bird that was flying in the sky',
        incomplete: ['_', '_', '_', '_'],
        answer: ['空', 'を', '飛んでいた', '鳥'],
        vocab_pieces: ['空', '飛んでいた', '鳥'],
        particle_pieces: ['を'],
        dummies: {
            vocab: ['海', '泳いでいた', '魚'],
            particle: ['は', 'が', 'で'],
        },
    },
    {
        floor: 84, tier: 'construction',
        JP: '水を飲んでいた子供',
        EN: 'the child who was drinking water',
        incomplete: ['_', '_', '_', '_'],
        answer: ['水', 'を', '飲んでいた', '子供'],
        vocab_pieces: ['水', '飲んでいた', '子供'],
        particle_pieces: ['を'],
        dummies: {
            vocab: ['お茶', '食べていた', '学生'],
            particle: ['は', 'が', 'に'],
        },
    },
    {
        floor: 85, tier: 'construction',
        JP: '車を運転していた父',
        EN: 'the father who was driving a car',
        incomplete: ['_', '_', '_', '_'],
        answer: ['車', 'を', '運転していた', '父'],
        vocab_pieces: ['車', '運転していた', '父'],
        particle_pieces: ['を'],
        dummies: {
            vocab: ['自転車', '修理していた', '兄'],
            particle: ['は', 'が', 'で'],
        },
    },
    {
        floor: 86, tier: 'construction',
        JP: '学校で待っていた先生',
        EN: 'the teacher who was waiting at school',
        incomplete: ['_', '_', '_', '_'],
        answer: ['学校', 'で', '待っていた', '先生'],
        vocab_pieces: ['学校', '待っていた', '先生'],
        particle_pieces: ['で'],
        dummies: {
            vocab: ['駅', '探していた', '学生'],
            particle: ['を', 'に', 'と'],
        },
    },
    {
        floor: 87, tier: 'construction',
        JP: '公園で遊んでいた友達',
        EN: 'the friend who was playing at the park',
        incomplete: ['_', '_', '_', '_'],
        answer: ['公園', 'で', '遊んでいた', '友達'],
        vocab_pieces: ['公園', '遊んでいた', '友達'],
        particle_pieces: ['で'],
        dummies: {
            vocab: ['学校', '走っていた', '子供'],
            particle: ['を', 'に', 'と'],
        },
    },
    {
        floor: 88, tier: 'construction',
        JP: '海で泳いでいた魚',
        EN: 'the fish that was swimming in the sea',
        incomplete: ['_', '_', '_', '_'],
        answer: ['海', 'で', '泳いでいた', '魚'],
        vocab_pieces: ['海', '泳いでいた', '魚'],
        particle_pieces: ['で'],
        dummies: {
            vocab: ['川', '飛んでいた', '鳥'],
            particle: ['を', 'に', 'と'],
        },
    },
    {
        floor: 89, tier: 'construction',
        JP: '家で寝ていた犬',
        EN: 'the dog that was sleeping at home',
        incomplete: ['_', '_', '_', '_'],
        answer: ['家', 'で', '寝ていた', '犬'],
        vocab_pieces: ['家', '寝ていた', '犬'],
        particle_pieces: ['で'],
        dummies: {
            vocab: ['庭', '起きていた', '猫'],
            particle: ['を', 'に', 'と'],
        },
    },
    {
        floor: 90, tier: 'construction',
        JP: '道を走っていた馬',
        EN: 'the horse that was running on the road',
        incomplete: ['_', '_', '_', '_'],
        answer: ['道', 'を', '走っていた', '馬'],
        vocab_pieces: ['道', '走っていた', '馬'],
        particle_pieces: ['を'],
        dummies: {
            vocab: ['川', '泳いでいた', '魚'],
            particle: ['は', 'が', 'で'],
        },
    },
    {
        floor: 91, tier: 'construction',
        JP: '塵も積もれば山となる',
        EN: 'even dust becomes a mountain if piled up',
        incomplete: ['_', '_', '_', '_', '_'],
        answer: ['塵', 'も', '積もれば', '山', 'となる'],
        vocab_pieces: ['塵', '積もれば', '山', 'となる'],
        particle_pieces: ['も'],
        dummies: {
            vocab: ['石', '集まれば', '川', 'になる'],
            particle: ['は', 'が', 'を'],
        },
    },
    {
        floor: 92, tier: 'construction',
        JP: '急がば回れ',
        EN: 'if you hurry, take the roundabout way',
        incomplete: ['_', '_'],
        answer: ['急がば', '回れ'],
        vocab_pieces: ['急がば', '回れ'],
        particle_pieces: [],
        dummies: {
            vocab: ['急げば', '走れ', '戻れ'],
            particle: ['を', 'に', 'で'],
        },
    },
    {
        floor: 93, tier: 'construction',
        JP: '猿も木から落ちる',
        EN: 'even monkeys fall from trees',
        incomplete: ['_', '_', '_', '_', '_'],
        answer: ['猿', 'も', '木', 'から', '落ちる'],
        vocab_pieces: ['猿', '木', '落ちる'],
        particle_pieces: ['も', 'から'],
        dummies: {
            vocab: ['鳥', '山', '飛ぶ'],
            particle: ['は', 'が', 'を'],
        },
    },
    {
        floor: 94, tier: 'construction',
        JP: '井の中の蛙大海を知らず',
        EN: 'a frog in a well does not know the great sea',
        incomplete: ['_', '_', '_', '_', '_', '_'],
        answer: ['井', 'の', '中', 'の', '蛙', '大海を知らず'],
        vocab_pieces: ['井', '中', '蛙', '大海を知らず'],
        particle_pieces: ['の'],
        dummies: {
            vocab: ['池', '外', '魚', '空を知らず'],
            particle: ['は', 'が', 'に'],
        },
    },
    {
        floor: 95, tier: 'construction',
        JP: '花より団子',
        EN: 'dumplings over flowers',
        incomplete: ['_', '_', '_'],
        answer: ['花', 'より', '団子'],
        vocab_pieces: ['花', '団子'],
        particle_pieces: ['より'],
        dummies: {
            vocab: ['月', '酒', '魚'],
            particle: ['から', 'まで', 'を'],
        },
    },
    {
        floor: 96, tier: 'construction',
        JP: '二兎を追う者は一兎をも得ず',
        EN: 'one who chases two rabbits catches neither',
        incomplete: ['_', '_', '_', '_', '_', '_', '_'],
        answer: ['二兎', 'を', '追う者', 'は', '一兎', 'をも', '得ず'],
        vocab_pieces: ['二兎', '追う者', '一兎', '得ず'],
        particle_pieces: ['を', 'は', 'をも'],
        dummies: {
            vocab: ['三兎', '待つ者', '魚', '取れず'],
            particle: ['が', 'に', 'で'],
        },
    },
    {
        floor: 97, tier: 'construction',
        JP: '虎穴に入らずんば虎子を得ず',
        EN: 'nothing ventured, nothing gained',
        incomplete: ['_', '_', '_', '_', '_'],
        answer: ['虎穴', 'に', '入らずんば', '虎子', 'を得ず'],
        vocab_pieces: ['虎穴', '入らずんば', '虎子', 'を得ず'],
        particle_pieces: ['に'],
        dummies: {
            vocab: ['山道', '行かずんば', '宝', '見えず'],
            particle: ['で', 'を', 'から'],
        },
    },
    {
        floor: 98, tier: 'construction',
        JP: '少年老いやすく学成り難し',
        EN: 'youth ages easily, and learning is hard to complete',
        incomplete: ['_', '_', '_', '_'],
        answer: ['少年', '老いやすく', '学', '成り難し'],
        vocab_pieces: ['少年', '老いやすく', '学', '成り難し'],
        particle_pieces: [],
        dummies: {
            vocab: ['大人', '忘れやすく', '道', '進み難し'],
            particle: ['は', 'が', 'を'],
        },
    },
    {
        floor: 99, tier: 'construction',
        JP: '人の振り見て我が振り直せ',
        EN: 'watch others and correct yourself',
        incomplete: ['_', '_', '_', '_', '_', '_'],
        answer: ['人', 'の', '振り', '見て', '我が', '振り直せ'],
        vocab_pieces: ['人', '振り', '見て', '我が', '振り直せ'],
        particle_pieces: ['の'],
        dummies: {
            vocab: ['友', '姿', '聞いて', '君の', '忘れろ'],
            particle: ['は', 'が', 'を'],
        },
    },
    {
        floor: 100, tier: 'construction',
        JP: '百聞は一見にしかず',
        EN: 'seeing once is better than hearing a hundred times',
        incomplete: ['_', '_', '_', '_', '_'],
        answer: ['百聞', 'は', '一見', 'に', 'しかず'],
        vocab_pieces: ['百聞', '一見', 'しかず'],
        particle_pieces: ['は', 'に'],
        dummies: {
            vocab: ['千言', '一読', '及ばず'],
            particle: ['が', 'を', 'で'],
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
