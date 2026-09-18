import { connectDatabase } from './config/db.js';
import { assertEnvironment } from './config/env.js';
import { Course } from './models/Course.js';
import { MockTest } from './models/MockTest.js';
import { Question } from './models/Question.js';

const assessmentQuestions = [
  { kind: 'assessment', examType: 'LEVEL_DETERMINATION', level: 'N5', section: 'Vocabulary', prompt: '「ねこ」はどのいみですか。', options: ['cat', 'book', 'water', 'school'], correctOption: 0, explanation: 'ねこ means cat.' },
  { kind: 'assessment', examType: 'LEVEL_DETERMINATION', level: 'N5', section: 'Grammar', prompt: 'わたし___がくせいです。', options: ['は', 'を', 'に', 'で'], correctOption: 0, explanation: 'は marks the topic: I am a student.' },
  { kind: 'assessment', examType: 'LEVEL_DETERMINATION', level: 'N5', section: 'Reading', prompt: '「おはようございます」はいつつかいますか。', options: ['Morning', 'Afternoon', 'Evening', 'Before sleep'], correctOption: 0, explanation: 'おはようございます is a morning greeting.' },
  { kind: 'assessment', examType: 'LEVEL_DETERMINATION', level: 'N4', section: 'Vocabulary', prompt: '「経験」のいみはなんですか。', options: ['experience', 'schedule', 'weather', 'medicine'], correctOption: 0, explanation: '経験 means experience.' },
  { kind: 'assessment', examType: 'LEVEL_DETERMINATION', level: 'N4', section: 'Grammar', prompt: '雨が___、出かけません。', options: ['ふったら', 'ふるとき', 'ふりながら', 'ふるので'], correctOption: 3, explanation: 'ので expresses a reason: because it rains.' },
  { kind: 'assessment', examType: 'LEVEL_DETERMINATION', level: 'N4', section: 'Reading', prompt: '来週の月曜日は何日ですか。', options: ['The Monday of next week', 'Yesterday', 'Every Monday', 'This morning'], correctOption: 0, explanation: '来週 means next week.' },
  { kind: 'assessment', examType: 'LEVEL_DETERMINATION', level: 'N3', section: 'Grammar', prompt: 'この問題は学生___解けるレベルです。', options: ['なら', 'ほど', 'しか', 'まで'], correctOption: 0, explanation: 'なら sets the condition or topic: for a student.' },
  { kind: 'assessment', examType: 'LEVEL_DETERMINATION', level: 'N3', section: 'Reading', prompt: '「一方で」に近い意味はどれですか。', options: ['On the other hand', 'In addition', 'Immediately', 'At last'], correctOption: 0, explanation: '一方で introduces a contrasting side.' },
  { kind: 'assessment', examType: 'LEVEL_DETERMINATION', level: 'N3', section: 'Kanji', prompt: '「複雑」の意味はどれですか。', options: ['Complex', 'Simple', 'Quiet', 'Famous'], correctOption: 0, explanation: '複雑 means complex.' }
];

const mockQuestions = [
  { kind: 'mock', examType: 'JLPT', level: 'N5', section: 'Vocabulary', prompt: '「先生」はどんな人ですか。', options: ['Teacher', 'Doctor', 'Driver', 'Cook'], correctOption: 0, explanation: '先生 commonly means teacher.' },
  { kind: 'mock', examType: 'JLPT', level: 'N5', section: 'Grammar', prompt: 'これは日本語___本です。', options: ['の', 'を', 'へ', 'が'], correctOption: 0, explanation: 'の connects Japanese and book: a Japanese-language book.' },
  { kind: 'mock', examType: 'JLPT', level: 'N5', section: 'Reading', prompt: '「駅」はどこですか。', options: ['Station', 'Hospital', 'Park', 'Office'], correctOption: 0, explanation: '駅 means station.' },
  { kind: 'mock', examType: 'JLPT', level: 'N5', section: 'Listening', prompt: '「みずをください」と言いました。何がほしいですか。', options: ['Water', 'Tea', 'Rice', 'Bread'], correctOption: 0, explanation: 'みず means water.' },
  { kind: 'mock', examType: 'NAT', level: 'N4', section: 'Grammar', prompt: '毎朝、コーヒーを___から会社へ行きます。', options: ['飲んで', '飲むと', '飲みたい', '飲めば'], correctOption: 0, explanation: 'て-form connects sequential actions.' },
  { kind: 'mock', examType: 'NAT', level: 'N4', section: 'Reading', prompt: '「予約」は何をすることですか。', options: ['Reserve in advance', 'Return an item', 'Study together', 'Change clothes'], correctOption: 0, explanation: '予約 means reservation or booking.' },
  { kind: 'mock', examType: 'NAT', level: 'N4', section: 'Kanji', prompt: '「必要」の意味はどれですか。', options: ['Necessary', 'Difficult', 'Convenient', 'Beautiful'], correctOption: 0, explanation: '必要 means necessary.' },
  { kind: 'mock', examType: 'NAT', level: 'N4', section: 'Listening', prompt: '「午後三時に会いましょう。」何時に会いますか。', options: ['3 PM', '3 AM', '12 PM', '5 PM'], correctOption: 0, explanation: '午後三時 means 3 PM.' },
  { kind: 'mock', examType: 'JFT', level: 'A2.1', section: 'Vocabulary', prompt: '「買い物」の意味はどれですか。', options: ['Shopping', 'Cooking', 'Walking', 'Cleaning'], correctOption: 0, explanation: '買い物 means shopping.' },
  { kind: 'mock', examType: 'JFT', level: 'A2.1', section: 'Grammar', prompt: '駅までバス___行きます。', options: ['で', 'を', 'が', 'と'], correctOption: 0, explanation: 'で marks the means of transportation.' },
  { kind: 'mock', examType: 'JFT', level: 'A2.1', section: 'Reading', prompt: '「入口」はどこですか。', options: ['Entrance', 'Exit', 'Elevator', 'Restroom'], correctOption: 0, explanation: '入口 means entrance.' },
  { kind: 'mock', examType: 'JFT', level: 'A2.1', section: 'Listening', prompt: '「今日は休みです。」どういう意味ですか。', options: ['Today is a day off', 'Today is busy', 'Today is cold', 'Today is late'], correctOption: 0, explanation: '休み means rest or a day off.' }
];

const courseSeeds = [
  {
    title: 'N5 Foundations: Everyday Japanese', level: 'N5', category: 'Grammar', durationMinutes: 75, featured: true,
    description: 'Build a calm, practical foundation with greetings, particles, and simple sentence patterns.',
    lessons: [
      { title: 'A gentle start with は and です', type: 'reading', durationMinutes: 18, content: 'わたしは学生です。これは本です。', explanation: 'は introduces the topic and です gives a polite statement.', transcript: '' },
      { title: 'Listening: Morning routines', type: 'listening', durationMinutes: 22, content: '朝の生活についての短い会話を聞きます。', explanation: 'Listen for time expressions and daily verbs.', transcript: 'おはようございます。七時に起きます。', audioUrl: '' },
      { title: 'Practice: Introduce yourself', type: 'practice', durationMinutes: 15, content: '名前、国、仕事を使って自己紹介を作りましょう。', explanation: 'Use short, clear sentences and the polite form.', transcript: '' }
    ]
  },
  {
    title: 'N5 Kanji in Context', level: 'N5', category: 'Kanji', durationMinutes: 60, featured: false,
    description: 'Recognise common beginner kanji through short, memorable everyday examples.',
    lessons: [
      { title: 'People and places', type: 'reading', durationMinutes: 20, content: '人、山、川、日、本を文の中で読みます。', explanation: 'Context makes recognition easier than isolated memorisation.', transcript: '' },
      { title: 'Reading signs around town', type: 'practice', durationMinutes: 20, content: '入口、出口、駅、学校を見つけましょう。', explanation: 'Many signs use kanji you already know.', transcript: '' }
    ]
  },
  {
    title: 'N4 Grammar for Confident Conversations', level: 'N4', category: 'Grammar', durationMinutes: 90, featured: true,
    description: 'Move beyond basic patterns with reasons, conditions, and connected actions.',
    lessons: [
      { title: 'Connect actions naturally', type: 'reading', durationMinutes: 24, content: '朝ご飯を食べて、学校へ行きます。', explanation: 'The て-form connects actions in a natural sequence.', transcript: '' },
      { title: 'Reasons with ので', type: 'practice', durationMinutes: 24, content: '雨なので、家にいます。', explanation: 'ので gives a softer, explanatory reason.', transcript: '' },
      { title: 'Listening: Make a plan', type: 'listening', durationMinutes: 25, content: '予定を相談する会話を聞きます。', explanation: 'Listen for dates, times, and polite suggestions.', transcript: '来週の月曜日に会いませんか。', audioUrl: '' }
    ]
  },
  {
    title: 'N4 Reading: Daily Life Notes', level: 'N4', category: 'Reading', durationMinutes: 70, featured: false,
    description: 'Read short notices, messages, and practical Japanese with a clear strategy.',
    lessons: [
      { title: 'Find the key detail', type: 'reading', durationMinutes: 20, content: '案内文から日時と場所を探します。', explanation: 'Read the question first, then scan for the matching detail.', transcript: '' },
      { title: 'Practice with short messages', type: 'practice', durationMinutes: 22, content: '友だちからのメッセージを読みましょう。', explanation: 'Notice who, when, where, and what action is requested.', transcript: '' }
    ]
  },
  {
    title: 'N3 Reading: Ideas and Contrast', level: 'N3', category: 'Reading', durationMinutes: 100, featured: true,
    description: 'Follow connected ideas, contrast, and the writer’s point of view in intermediate passages.',
    lessons: [
      { title: 'Recognise contrast markers', type: 'reading', durationMinutes: 26, content: '一方で、しかし、それでもを文章で読みます。', explanation: 'Contrast markers help you predict how an idea will change.', transcript: '' },
      { title: 'Reading for the main idea', type: 'practice', durationMinutes: 28, content: '段落の最初と最後に注目しましょう。', explanation: 'The main idea is often repeated or clarified at the end.', transcript: '' }
    ]
  },
  {
    title: 'N3 Listening: Clearer Conversations', level: 'N3', category: 'Listening', durationMinutes: 85, featured: false,
    description: 'Build listening confidence with context, intent, and everyday workplace conversations.',
    lessons: [
      { title: 'Understand the speaker’s intention', type: 'listening', durationMinutes: 25, content: '依頼と提案の会話を聞きます。', explanation: 'Pay attention to soft requests and implied meaning.', transcript: 'もしよければ、資料を確認していただけますか。', audioUrl: '' },
      { title: 'Note-taking for key facts', type: 'practice', durationMinutes: 22, content: '会話から人、時間、場所を書き留めます。', explanation: 'Short notes reduce memory load while listening.', transcript: '' }
    ]
  }
];

async function seed() {
  assertEnvironment();
  await connectDatabase();
  await Question.deleteMany({});
  await MockTest.deleteMany({});
  await Course.deleteMany({});

  const seedQuestions = [...assessmentQuestions, ...mockQuestions].map((question) => ({
    ...question,
    options: question.options.map((text) => ({ text }))
  }));
  const questions = await Question.insertMany(seedQuestions);
  const byPrompt = new Map(questions.map((question) => [question.prompt, question]));
  const mockTests = [
    {
      examType: 'JLPT', level: 'N5', title: 'JLPT N5 Foundation Mock 01', description: 'A focused first mock covering the core N5 sections.',
      questionIds: mockQuestions.filter((question) => question.examType === 'JLPT').map((question) => byPrompt.get(question.prompt)._id),
      sections: ['Vocabulary', 'Grammar', 'Reading', 'Listening'], durationMinutes: 12, difficulty: 'Foundational'
    },
    {
      examType: 'NAT', level: 'N4', title: 'NAT N4 Everyday Japanese Mock 01', description: 'Practice practical N4 language with balanced section coverage.',
      questionIds: mockQuestions.filter((question) => question.examType === 'NAT').map((question) => byPrompt.get(question.prompt)._id),
      sections: ['Grammar', 'Reading', 'Kanji', 'Listening'], durationMinutes: 14, difficulty: 'Intermediate'
    },
    {
      examType: 'JFT', level: 'A2.1', title: 'JFT A2.1 Daily Communication Mock 01', description: 'A compact demo test for familiar daily-life communication.',
      questionIds: mockQuestions.filter((question) => question.examType === 'JFT').map((question) => byPrompt.get(question.prompt)._id),
      sections: ['Vocabulary', 'Grammar', 'Reading', 'Listening'], durationMinutes: 14, difficulty: 'Intermediate'
    }
  ];
  await MockTest.insertMany(mockTests);
  await Course.insertMany(courseSeeds);
  console.log('Demo seed data loaded.');
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
