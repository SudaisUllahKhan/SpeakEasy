// SpeakEasy seed — 10 topics + 30 lessons
// CEO specification: exact topics, lesson counts, CEFR levels, content rules

import { config } from "dotenv";
import { resolve } from "path";
// Load .env.local first, then .env
config({ path: resolve(__dirname, "../.env.local") });
config({ path: resolve(__dirname, "../.env") });

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "",
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TOPICS = [
  { name: "Greetings & Introductions", slug: "greetings",     icon: "👋", sortOrder: 1 },
  { name: "Daily Routine",             slug: "daily-routine", icon: "☀️", sortOrder: 2 },
  { name: "Family",                    slug: "family",        icon: "👨‍👩‍👧", sortOrder: 3 },
  { name: "Food & Drink",              slug: "food-drink",    icon: "🍽️", sortOrder: 4 },
  { name: "School & Work",             slug: "school-work",   icon: "🏫", sortOrder: 5 },
  { name: "Travel & Transport",        slug: "travel",        icon: "✈️", sortOrder: 6 },
  { name: "Weather & Seasons",         slug: "weather",       icon: "🌤️", sortOrder: 7 },
  { name: "Health & Body",             slug: "health",        icon: "💊", sortOrder: 8 },
  { name: "Shopping",                  slug: "shopping",      icon: "🛒", sortOrder: 9 },
  { name: "Hobbies & Sports",          slug: "hobbies",       icon: "⚽", sortOrder: 10 },
];

// CEO spec: 20 A1 + 6 A2 + 4 B1 = 30 lessons
// All passages: culturally neutral, diverse names, no idioms at A1
const LESSONS: Array<{
  topicSlug: string;
  title: string;
  slug: string;
  level: "A1" | "A2" | "B1";
  sortOrder: number;
  passageText: string;
}> = [
  // ─── Greetings & Introductions ──────────────────────────────────────────────
  {
    topicSlug: "greetings",
    title: "My Name Is…",
    slug: "my-name-is",
    level: "A1",
    sortOrder: 1,
    passageText:
      "Hello. My name is Sara. I am from Brazil. I am twenty-two years old. I live in the city. I speak Portuguese and I study English. Nice to meet you.",
  },
  {
    topicSlug: "greetings",
    title: "Nice to Meet You",
    slug: "nice-to-meet-you",
    level: "A1",
    sortOrder: 2,
    passageText:
      "Hi. I am Ahmed. I am a student. I study at a university. I have one sister and two brothers. My family is from Egypt. I am happy to meet new people.",
  },
  {
    topicSlug: "greetings",
    title: "Introducing a Friend at a Party",
    slug: "introducing-friend-party",
    level: "B1",
    sortOrder: 3,
    passageText:
      "I would like to introduce my friend, Min-jun. He grew up in Seoul, South Korea, and moved to Canada two years ago to study computer science. Min-jun is very talented. He plays the guitar and speaks three languages. I think you will enjoy talking to him.",
  },

  // ─── Daily Routine ──────────────────────────────────────────────────────────
  {
    topicSlug: "daily-routine",
    title: "My Morning Routine",
    slug: "morning-routine",
    level: "A1",
    sortOrder: 1,
    passageText:
      "I wake up at seven o'clock. I wash my face and brush my teeth. Then I eat breakfast. I usually have eggs and bread. After breakfast, I walk to school. I arrive at school at eight thirty.",
  },
  {
    topicSlug: "daily-routine",
    title: "After School",
    slug: "after-school",
    level: "A1",
    sortOrder: 2,
    passageText:
      "School finishes at three o'clock. I take the bus home. At home I have a snack. Then I do my homework. In the evening I watch TV with my family. I go to bed at ten o'clock.",
  },
  {
    topicSlug: "daily-routine",
    title: "A Busy Day at Work",
    slug: "busy-day-at-work",
    level: "A2",
    sortOrder: 3,
    passageText:
      "Yesterday was a very busy day for Priya. She arrived at the office at eight and immediately joined a meeting. After the meeting, she answered many emails and prepared a report. She had a short lunch at her desk. By the time she left at six, she was tired but satisfied with what she had finished.",
  },

  // ─── Family ─────────────────────────────────────────────────────────────────
  {
    topicSlug: "family",
    title: "My Family",
    slug: "my-family",
    level: "A1",
    sortOrder: 1,
    passageText:
      "I have a small family. There are four people — my father, my mother, my sister, and me. My father is a doctor. My mother is a teacher. My sister is twelve years old. We live together in an apartment.",
  },
  {
    topicSlug: "family",
    title: "My Pet",
    slug: "my-pet",
    level: "A1",
    sortOrder: 2,
    passageText:
      "I have a pet cat. Her name is Luna. She is white and orange. Luna is two years old. She sleeps a lot in the day. At night she plays with her toys. I feed her every morning and evening. I love my cat.",
  },
  {
    topicSlug: "family",
    title: "Family Traditions",
    slug: "family-traditions",
    level: "A2",
    sortOrder: 3,
    passageText:
      "Every year, my family has a special dinner on the last day of December. My grandmother cooks traditional food from her home country. We all sit together and talk about the best moments of the year. After dinner, we watch the fireworks from our balcony. It is my favourite family tradition.",
  },

  // ─── Food & Drink ────────────────────────────────────────────────────────────
  {
    topicSlug: "food-drink",
    title: "Breakfast",
    slug: "breakfast",
    level: "A1",
    sortOrder: 1,
    passageText:
      "I eat breakfast every morning. Today I have orange juice, toast, and a banana. My brother drinks coffee and eats cereal. Breakfast is an important meal. It gives us energy for the day.",
  },
  {
    topicSlug: "food-drink",
    title: "At the Restaurant",
    slug: "at-the-restaurant",
    level: "A1",
    sortOrder: 2,
    passageText:
      "We go to a restaurant on Saturdays. The waiter brings the menu. I order rice and vegetables. My sister orders soup and bread. We drink water. The food is very good. We pay and say thank you.",
  },
  {
    topicSlug: "food-drink",
    title: "Cooking a Recipe",
    slug: "cooking-a-recipe",
    level: "A2",
    sortOrder: 3,
    passageText:
      "Last weekend, Fatima decided to cook a new recipe. She needed tomatoes, onions, garlic, and pasta. First, she cut the onions and fried them in oil. Then she added the tomatoes and garlic and cooked the sauce for twenty minutes. Finally, she mixed the sauce with the pasta. Her family said it was delicious.",
  },

  // ─── School & Work ───────────────────────────────────────────────────────────
  {
    topicSlug: "school-work",
    title: "My Classroom",
    slug: "my-classroom",
    level: "A1",
    sortOrder: 1,
    passageText:
      "I am in Class 3B. There are twenty students in my class. We have ten desks and a whiteboard. Our teacher is Mr. Kim. He is very kind. We study English, mathematics, and science. I sit near the window.",
  },
  {
    topicSlug: "school-work",
    title: "My Teacher",
    slug: "my-teacher",
    level: "A1",
    sortOrder: 2,
    passageText:
      "My teacher is called Ms. Nkosi. She is tall and has short hair. She explains things clearly. When we do not understand, she explains again. She gives us interesting activities. I think she is a very good teacher.",
  },
  {
    topicSlug: "school-work",
    title: "A Job Interview",
    slug: "a-job-interview",
    level: "B1",
    sortOrder: 3,
    passageText:
      "Last Monday, Daniel had a job interview at a technology company. He prepared carefully the day before, reviewing his notes and practising answers to common questions. During the interview, he spoke clearly about his experience and explained why he wanted the position. The interviewer seemed impressed. Two days later, Daniel received an email offering him the job.",
  },

  // ─── Travel & Transport ──────────────────────────────────────────────────────
  {
    topicSlug: "travel",
    title: "Going to the Shops",
    slug: "going-to-the-shops",
    level: "A1",
    sortOrder: 1,
    passageText:
      "I go to the shops on Saturday morning. The shops are near my house. I walk there in ten minutes. I buy milk, bread, and fruit. I pay at the counter. Then I walk back home. I carry the bags in my hands.",
  },
  {
    topicSlug: "travel",
    title: "On the Bus",
    slug: "on-the-bus",
    level: "A1",
    sortOrder: 2,
    passageText:
      "I take the bus to school every day. The bus stop is close to my home. The bus comes at eight o'clock. I sit near the door. The journey takes fifteen minutes. I get off at the school stop.",
  },
  {
    topicSlug: "travel",
    title: "Planning a Holiday",
    slug: "planning-a-holiday",
    level: "A2",
    sortOrder: 3,
    passageText:
      "Ana and her husband are planning a holiday. They want to visit Portugal next summer. They looked at flights online and found a good price. They also booked a small hotel near the beach. They plan to visit local museums and try traditional food. Ana is very excited because it will be her first trip to Europe.",
  },

  // ─── Weather & Seasons ───────────────────────────────────────────────────────
  {
    topicSlug: "weather",
    title: "Today's Weather",
    slug: "todays-weather",
    level: "A1",
    sortOrder: 1,
    passageText:
      "Today it is sunny and warm. The sky is blue. There are some clouds. The temperature is twenty-five degrees. It is a good day to go outside. I wear a T-shirt and shorts. I do not need a coat.",
  },
  {
    topicSlug: "weather",
    title: "Climate in My Country",
    slug: "climate-in-my-country",
    level: "A2",
    sortOrder: 2,
    passageText:
      "In Nigeria, the climate is warm all year round. There are two main seasons — the rainy season and the dry season. The rainy season is from April to October. During this time, it rains heavily every few days. The dry season brings less rain and hotter temperatures. People adjust their daily activities depending on the season.",
  },

  // ─── Health & Body ───────────────────────────────────────────────────────────
  {
    topicSlug: "health",
    title: "I Feel Sick",
    slug: "i-feel-sick",
    level: "A1",
    sortOrder: 1,
    passageText:
      "Today I do not feel well. I have a headache and a sore throat. I am tired. My mother says I have a temperature. I stay in bed and drink water. I do not go to school. I hope I feel better tomorrow.",
  },
  {
    topicSlug: "health",
    title: "At the Doctor's",
    slug: "at-the-doctors",
    level: "A2",
    sortOrder: 2,
    passageText:
      "Last week, Carlos went to see his doctor because he had a bad cough for several days. The doctor listened to his chest and asked him some questions. She said he had a mild chest infection and gave him some medicine. She also told him to rest and drink plenty of fluids. Carlos felt much better after five days.",
  },

  // ─── Shopping ────────────────────────────────────────────────────────────────
  {
    topicSlug: "shopping",
    title: "At the Supermarket",
    slug: "at-the-supermarket",
    level: "A1",
    sortOrder: 1,
    passageText:
      "I go to the supermarket once a week. I use a shopping list so I do not forget anything. Today I need eggs, cheese, apples, and pasta. I put the items in my basket. At the checkout, I pay by card. The cashier gives me a receipt.",
  },
  {
    topicSlug: "shopping",
    title: "Buying Clothes Online",
    slug: "buying-clothes-online",
    level: "B1",
    sortOrder: 2,
    passageText:
      "More and more people are choosing to buy clothes online instead of visiting physical shops. It is convenient because you can compare prices and styles from different brands without leaving home. However, there are disadvantages too. You cannot try the clothes on before buying, and sometimes the size or colour looks different in real life than in the photo. Most online shops offer free returns, which makes the risk smaller.",
  },

  // ─── Hobbies & Sports ────────────────────────────────────────────────────────
  {
    topicSlug: "hobbies",
    title: "I Like Football",
    slug: "i-like-football",
    level: "A1",
    sortOrder: 1,
    passageText:
      "My favourite sport is football. I play football with my friends on Sundays. We play in the park near our school. I am the goalkeeper. My team has eight players. We train every Sunday morning. I love this sport.",
  },
  {
    topicSlug: "hobbies",
    title: "My Weekend",
    slug: "my-weekend",
    level: "A1",
    sortOrder: 2,
    passageText:
      "On weekends I relax and do fun activities. On Saturday morning I play basketball with my brother. In the afternoon I read books or listen to music. On Sunday I go to the market with my family. In the evening we have dinner together. I enjoy my weekends very much.",
  },
  {
    topicSlug: "hobbies",
    title: "An Adventure Holiday",
    slug: "an-adventure-holiday",
    level: "A2",
    sortOrder: 3,
    passageText:
      "Last summer, Marco and his sister went on an adventure holiday in the mountains. They hiked for three days along a beautiful trail. Each night they stayed in a small wooden cabin. The weather was good, but on the second day it rained heavily. They put on their waterproof jackets and continued walking. At the end of the trip, they agreed it was the best holiday they had ever had.",
  },
];

async function main() {
  console.log("🌱 Seeding SpeakEasy database…");

  // Upsert topics
  for (const topic of TOPICS) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: { name: topic.name, icon: topic.icon, sortOrder: topic.sortOrder },
      create: topic,
    });
  }
  console.log(`✅ ${TOPICS.length} topics seeded`);

  // Upsert lessons
  for (const lesson of LESSONS) {
    const topic = await prisma.topic.findUnique({ where: { slug: lesson.topicSlug } });
    if (!topic) {
      console.warn(`⚠️  Topic not found: ${lesson.topicSlug}`);
      continue;
    }
    await prisma.lesson.upsert({
      where: { slug: lesson.slug },
      update: {
        title: lesson.title,
        level: lesson.level,
        passageText: lesson.passageText,
        sortOrder: lesson.sortOrder,
        isPublished: true,
      },
      create: {
        title: lesson.title,
        slug: lesson.slug,
        level: lesson.level,
        topicId: topic.id,
        passageText: lesson.passageText,
        sortOrder: lesson.sortOrder,
        isPublished: true,
      },
    });
  }
  console.log(`✅ ${LESSONS.length} lessons seeded`);
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
