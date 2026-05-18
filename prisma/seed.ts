// SpeakEasy seed — 10 topics × 3 levels × 2 lessons = 60 lessons minimum
// Every topic has content at A1, A2, and B1 so no topic is empty for any level.

import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });
config({ path: resolve(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
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
  { name: "Family",                    slug: "family",        icon: "🏡", sortOrder: 3 },
  { name: "Food & Drink",              slug: "food-drink",    icon: "🍽️", sortOrder: 4 },
  { name: "School & Work",             slug: "school-work",   icon: "🏫", sortOrder: 5 },
  { name: "Travel & Transport",        slug: "travel",        icon: "✈️", sortOrder: 6 },
  { name: "Weather & Seasons",         slug: "weather",       icon: "🌤️", sortOrder: 7 },
  { name: "Health & Body",             slug: "health",        icon: "💊", sortOrder: 8 },
  { name: "Shopping",                  slug: "shopping",      icon: "🛒", sortOrder: 9 },
  { name: "Hobbies & Sports",          slug: "hobbies",       icon: "⚽", sortOrder: 10 },
];

const LESSONS: Array<{
  topicSlug: string;
  title: string;
  slug: string;
  level: "A1" | "A2" | "B1";
  sortOrder: number;
  passageText: string;
}> = [

  // ══════════════════════════════════════════════════════════════════════════════
  // GREETINGS & INTRODUCTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  {
    topicSlug: "greetings", title: "My Name Is…", slug: "my-name-is",
    level: "A1", sortOrder: 1,
    passageText: "Hello. My name is Sara. I am from Brazil. I am twenty-two years old. I live in the city. I speak Portuguese and I study English. Nice to meet you.",
  },
  {
    topicSlug: "greetings", title: "Nice to Meet You", slug: "nice-to-meet-you",
    level: "A1", sortOrder: 2,
    passageText: "Hi. I am Ahmed. I am a student. I study at a university. I have one sister and two brothers. My family is from Egypt. I am happy to meet new people.",
  },
  {
    topicSlug: "greetings", title: "Talking About Yourself", slug: "talking-about-yourself",
    level: "A2", sortOrder: 3,
    passageText: "My name is Lena and I am from Germany. I moved to London two years ago to improve my English. I work as a graphic designer and I enjoy my job very much. In my free time, I like painting and going for long walks. I think learning a new language is one of the best things a person can do.",
  },
  {
    topicSlug: "greetings", title: "Meeting a New Neighbour", slug: "meeting-new-neighbour",
    level: "A2", sortOrder: 4,
    passageText: "Last week, a new family moved into the flat next door. I knocked on their door and introduced myself. Their names are Raj and Priya. They have two children who go to the local school. We had a short conversation and they seemed very friendly. I invited them to have tea at my place this weekend.",
  },
  {
    topicSlug: "greetings", title: "Introducing a Friend at a Party", slug: "introducing-friend-party",
    level: "B1", sortOrder: 5,
    passageText: "I would like to introduce my friend, Min-jun. He grew up in Seoul, South Korea, and moved to Canada two years ago to study computer science. Min-jun is very talented. He plays the guitar and speaks three languages fluently. He is also one of the most generous people I know. I think you will really enjoy talking to him tonight.",
  },
  {
    topicSlug: "greetings", title: "First Day at a New Job", slug: "first-day-new-job",
    level: "B1", sortOrder: 6,
    passageText: "Starting a new job can feel both exciting and nerve-wracking. On your first day, it is important to arrive on time, introduce yourself confidently, and listen carefully to your colleagues. Try to remember names and ask thoughtful questions. Most people are willing to help a new team member settle in. By the end of the week, you will start to feel more comfortable and confident in your new environment.",
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // DAILY ROUTINE
  // ══════════════════════════════════════════════════════════════════════════════
  {
    topicSlug: "daily-routine", title: "My Morning Routine", slug: "morning-routine",
    level: "A1", sortOrder: 1,
    passageText: "I wake up at seven o'clock. I wash my face and brush my teeth. Then I eat breakfast. I usually have eggs and bread. After breakfast, I walk to school. I arrive at school at eight thirty.",
  },
  {
    topicSlug: "daily-routine", title: "After School", slug: "after-school",
    level: "A1", sortOrder: 2,
    passageText: "School finishes at three o'clock. I take the bus home. At home I have a snack. Then I do my homework. In the evening I watch TV with my family. I go to bed at ten o'clock.",
  },
  {
    topicSlug: "daily-routine", title: "A Busy Day at Work", slug: "busy-day-at-work",
    level: "A2", sortOrder: 3,
    passageText: "Yesterday was a very busy day for Priya. She arrived at the office at eight and immediately joined a meeting. After the meeting, she answered many emails and prepared a report. She had a short lunch at her desk. By the time she left at six, she was tired but satisfied with what she had finished.",
  },
  {
    topicSlug: "daily-routine", title: "Weekend Plans", slug: "weekend-plans",
    level: "A2", sortOrder: 4,
    passageText: "On Saturday, Tom woke up later than usual. He made a cup of coffee and read the news on his phone. Then he called his friend to make plans. They decided to visit the market in the morning and watch a film in the afternoon. Tom also needed to clean his flat and do some laundry. He made a list so he would not forget anything.",
  },
  {
    topicSlug: "daily-routine", title: "Building Better Habits", slug: "building-better-habits",
    level: "B1", sortOrder: 5,
    passageText: "Many people struggle to build consistent daily habits. Experts suggest starting small — choosing one simple action and doing it at the same time every day. For example, if you want to exercise more, begin with just ten minutes each morning. Over time, the habit becomes automatic and you can gradually increase it. The key is not perfection, but consistency. Missing one day is fine as long as you return to your routine the next day.",
  },
  {
    topicSlug: "daily-routine", title: "Working from Home", slug: "working-from-home",
    level: "B1", sortOrder: 6,
    passageText: "Since the pandemic, many companies have adopted flexible working arrangements. Working from home offers clear advantages: less commuting time, a quieter environment, and greater control over your schedule. However, it also brings challenges such as social isolation and difficulty separating work from personal life. Successful remote workers often create a dedicated workspace, stick to regular hours, and take proper breaks throughout the day.",
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // FAMILY
  // ══════════════════════════════════════════════════════════════════════════════
  {
    topicSlug: "family", title: "My Family", slug: "my-family",
    level: "A1", sortOrder: 1,
    passageText: "I have a small family. There are four people — my father, my mother, my sister, and me. My father is a doctor. My mother is a teacher. My sister is twelve years old. We live together in an apartment.",
  },
  {
    topicSlug: "family", title: "My Pet", slug: "my-pet",
    level: "A1", sortOrder: 2,
    passageText: "I have a pet cat. Her name is Luna. She is white and orange. Luna is two years old. She sleeps a lot in the day. At night she plays with her toys. I feed her every morning and evening. I love my cat.",
  },
  {
    topicSlug: "family", title: "Family Traditions", slug: "family-traditions",
    level: "A2", sortOrder: 3,
    passageText: "Every year, my family has a special dinner on the last day of December. My grandmother cooks traditional food from her home country. We all sit together and talk about the best moments of the year. After dinner, we watch the fireworks from our balcony. It is my favourite family tradition.",
  },
  {
    topicSlug: "family", title: "Growing Up with Siblings", slug: "growing-up-with-siblings",
    level: "A2", sortOrder: 4,
    passageText: "Maria has two older brothers and one younger sister. Growing up, they shared a bedroom and often argued about small things. But they also helped each other with homework and played games together after school. Now that they are adults and live in different cities, Maria says she misses her siblings and calls them every week.",
  },
  {
    topicSlug: "family", title: "Changing Family Roles", slug: "changing-family-roles",
    level: "B1", sortOrder: 5,
    passageText: "In many parts of the world, family structures are changing. Traditionally, fathers worked outside the home while mothers stayed to care for children. Today, many families share these responsibilities more equally. Some fathers take parental leave, while some mothers pursue demanding careers. These shifts reflect broader changes in attitudes towards gender, work, and personal fulfilment. Despite these changes, the core purpose of family — providing support and belonging — remains the same.",
  },
  {
    topicSlug: "family", title: "Caring for Elderly Parents", slug: "caring-for-elderly-parents",
    level: "B1", sortOrder: 6,
    passageText: "As populations age, more adults are taking on the responsibility of caring for elderly parents. This can be emotionally and physically demanding, especially when combined with full-time work and raising children. Some families hire professional carers, while others move elderly relatives into their homes. Good communication within the family is essential to share the responsibilities fairly and ensure that the elderly person feels respected and not like a burden.",
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // FOOD & DRINK
  // ══════════════════════════════════════════════════════════════════════════════
  {
    topicSlug: "food-drink", title: "Breakfast", slug: "breakfast",
    level: "A1", sortOrder: 1,
    passageText: "I eat breakfast every morning. Today I have orange juice, toast, and a banana. My brother drinks coffee and eats cereal. Breakfast is an important meal. It gives us energy for the day.",
  },
  {
    topicSlug: "food-drink", title: "At the Restaurant", slug: "at-the-restaurant",
    level: "A1", sortOrder: 2,
    passageText: "We go to a restaurant on Saturdays. The waiter brings the menu. I order rice and vegetables. My sister orders soup and bread. We drink water. The food is very good. We pay and say thank you.",
  },
  {
    topicSlug: "food-drink", title: "Cooking a Recipe", slug: "cooking-a-recipe",
    level: "A2", sortOrder: 3,
    passageText: "Last weekend, Fatima decided to cook a new recipe. She needed tomatoes, onions, garlic, and pasta. First, she cut the onions and fried them in oil. Then she added the tomatoes and garlic and cooked the sauce for twenty minutes. Finally, she mixed the sauce with the pasta. Her family said it was delicious.",
  },
  {
    topicSlug: "food-drink", title: "Food from Around the World", slug: "food-around-the-world",
    level: "A2", sortOrder: 4,
    passageText: "Different countries have very different food cultures. In Japan, people often eat rice, fish, and vegetables. In Mexico, corn, beans, and chilli peppers are common ingredients. In Italy, pasta and pizza are famous worldwide. Trying food from other cultures is a wonderful way to learn about people and their traditions. Many people say that sharing a meal is one of the best ways to make new friends.",
  },
  {
    topicSlug: "food-drink", title: "Eating Habits and Health", slug: "eating-habits-health",
    level: "B1", sortOrder: 5,
    passageText: "Nutritionists agree that what we eat has a significant impact on our physical and mental health. A diet rich in vegetables, whole grains, and lean protein supports energy levels and reduces the risk of chronic disease. However, with busy modern lifestyles, many people rely heavily on processed and fast food, which tends to be high in salt, sugar, and unhealthy fats. Small changes, such as cooking at home more often and reducing sugary drinks, can make a substantial difference over time.",
  },
  {
    topicSlug: "food-drink", title: "The Rise of Plant-Based Diets", slug: "plant-based-diets",
    level: "B1", sortOrder: 6,
    passageText: "In recent years, plant-based diets have become increasingly popular around the world. People choose to eat less meat for various reasons including environmental concerns, animal welfare, and personal health. Studies suggest that reducing meat consumption can lower the risk of heart disease and some cancers. Plant-based proteins such as lentils, chickpeas, and tofu are nutritious and versatile. However, it is important to plan a balanced diet carefully to avoid deficiencies in nutrients like vitamin B12 and iron.",
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // SCHOOL & WORK
  // ══════════════════════════════════════════════════════════════════════════════
  {
    topicSlug: "school-work", title: "My Classroom", slug: "my-classroom",
    level: "A1", sortOrder: 1,
    passageText: "I am in Class 3B. There are twenty students in my class. We have ten desks and a whiteboard. Our teacher is Mr. Kim. He is very kind. We study English, mathematics, and science. I sit near the window.",
  },
  {
    topicSlug: "school-work", title: "My Teacher", slug: "my-teacher",
    level: "A1", sortOrder: 2,
    passageText: "My teacher is called Ms. Nkosi. She is tall and has short hair. She explains things clearly. When we do not understand, she explains again. She gives us interesting activities. I think she is a very good teacher.",
  },
  {
    topicSlug: "school-work", title: "Preparing for an Exam", slug: "preparing-for-exam",
    level: "A2", sortOrder: 3,
    passageText: "Next week, Sofia has an important mathematics exam. She started preparing three weeks ago by reviewing her notes and practising past papers. Every evening she studies for one hour. She also asks her teacher questions when she does not understand something. She feels nervous but confident. Her parents told her to sleep well the night before the exam.",
  },
  {
    topicSlug: "school-work", title: "Starting a New Job", slug: "starting-new-job",
    level: "A2", sortOrder: 4,
    passageText: "Last month, Hassan started working at a new company. On his first day, his manager showed him around the office and introduced him to his colleagues. He learned how to use the company's computer system and attended a training session. At first, he found it difficult to remember everything, but after two weeks he felt much more comfortable. He enjoys his new role and has already made some good friends at work.",
  },
  {
    topicSlug: "school-work", title: "A Job Interview", slug: "a-job-interview",
    level: "B1", sortOrder: 5,
    passageText: "Last Monday, Daniel had a job interview at a technology company. He prepared carefully the day before, reviewing his notes and practising answers to common questions. During the interview, he spoke clearly about his experience and explained why he wanted the position. The interviewer seemed impressed. Two days later, Daniel received an email offering him the job.",
  },
  {
    topicSlug: "school-work", title: "The Future of Education", slug: "future-of-education",
    level: "B1", sortOrder: 6,
    passageText: "Technology is transforming the way people learn. Online courses, video lectures, and interactive apps make it possible to study almost any subject from anywhere in the world. Some educators believe that traditional classrooms will become less important as self-directed digital learning grows. However, others argue that physical schools provide something irreplaceable: face-to-face interaction, collaboration, and social development. The most likely future involves a blend of both approaches, tailored to the needs of individual learners.",
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // TRAVEL & TRANSPORT
  // ══════════════════════════════════════════════════════════════════════════════
  {
    topicSlug: "travel", title: "Going to the Shops", slug: "going-to-the-shops",
    level: "A1", sortOrder: 1,
    passageText: "I go to the shops on Saturday morning. The shops are near my house. I walk there in ten minutes. I buy milk, bread, and fruit. I pay at the counter. Then I walk back home. I carry the bags in my hands.",
  },
  {
    topicSlug: "travel", title: "On the Bus", slug: "on-the-bus",
    level: "A1", sortOrder: 2,
    passageText: "I take the bus to school every day. The bus stop is close to my home. The bus comes at eight o'clock. I sit near the door. The journey takes fifteen minutes. I get off at the school stop.",
  },
  {
    topicSlug: "travel", title: "Planning a Holiday", slug: "planning-a-holiday",
    level: "A2", sortOrder: 3,
    passageText: "Ana and her husband are planning a holiday. They want to visit Portugal next summer. They looked at flights online and found a good price. They also booked a small hotel near the beach. They plan to visit local museums and try traditional food. Ana is very excited because it will be her first trip to Europe.",
  },
  {
    topicSlug: "travel", title: "A Train Journey", slug: "a-train-journey",
    level: "A2", sortOrder: 4,
    passageText: "Last spring, Yuki travelled by train from Tokyo to Kyoto. The journey took about two and a half hours on the high-speed train. She sat next to the window and watched the countryside pass by. She brought a book and some snacks. When she arrived in Kyoto, she felt refreshed and ready to explore the city. She said the train journey was one of the most enjoyable parts of her trip.",
  },
  {
    topicSlug: "travel", title: "Travelling on a Budget", slug: "travelling-on-a-budget",
    level: "B1", sortOrder: 5,
    passageText: "Travelling does not have to be expensive if you plan carefully. Booking flights and accommodation well in advance can save a significant amount of money. Choosing destinations in the off-season also reduces costs considerably. Many travellers save money by staying in hostels, cooking their own meals, and using public transport instead of taxis. Free attractions such as parks, markets, and museums with no entry fee can provide rich experiences without straining the budget.",
  },
  {
    topicSlug: "travel", title: "The Impact of Tourism", slug: "impact-of-tourism",
    level: "B1", sortOrder: 6,
    passageText: "Tourism brings significant economic benefits to many regions, creating jobs and generating income for local businesses. However, it can also have negative consequences. Popular tourist destinations often suffer from overcrowding, environmental damage, and rising living costs for local residents. Responsible tourism — which involves respecting local cultures, minimising waste, and supporting locally owned businesses — is becoming an increasingly important concept as people become more aware of these issues.",
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // WEATHER & SEASONS
  // ══════════════════════════════════════════════════════════════════════════════
  {
    topicSlug: "weather", title: "Today's Weather", slug: "todays-weather",
    level: "A1", sortOrder: 1,
    passageText: "Today it is sunny and warm. The sky is blue. There are some clouds. The temperature is twenty-five degrees. It is a good day to go outside. I wear a T-shirt and shorts. I do not need a coat.",
  },
  {
    topicSlug: "weather", title: "My Favourite Season", slug: "my-favourite-season",
    level: "A1", sortOrder: 2,
    passageText: "My favourite season is winter. I like cold weather. In winter I wear a big coat and a scarf. I drink hot chocolate in the evening. Sometimes it snows. Snow is very beautiful. My brother and I play in the snow.",
  },
  {
    topicSlug: "weather", title: "Climate in My Country", slug: "climate-in-my-country",
    level: "A2", sortOrder: 3,
    passageText: "In Nigeria, the climate is warm all year round. There are two main seasons — the rainy season and the dry season. The rainy season is from April to October. During this time, it rains heavily every few days. The dry season brings less rain and hotter temperatures. People adjust their daily activities depending on the season.",
  },
  {
    topicSlug: "weather", title: "An Unexpected Storm", slug: "an-unexpected-storm",
    level: "A2", sortOrder: 4,
    passageText: "Last Saturday, the weather changed suddenly while Pedro was hiking in the hills. The sky turned dark grey and strong winds began to blow. Then heavy rain started to fall. Pedro had not brought a waterproof jacket because the morning had been sunny. He found a large tree to shelter under and waited for the rain to stop. After thirty minutes, the storm passed and the sun came out again.",
  },
  {
    topicSlug: "weather", title: "Climate Change and Extreme Weather", slug: "climate-change-weather",
    level: "B1", sortOrder: 5,
    passageText: "Scientists have observed that extreme weather events are becoming more frequent and more intense as a result of climate change. Heatwaves, floods, droughts, and powerful storms are affecting communities around the world. Rising global temperatures, caused mainly by the burning of fossil fuels, are disrupting natural weather patterns. Governments, businesses, and individuals all have a role to play in reducing carbon emissions and adapting to the changes that are already underway.",
  },
  {
    topicSlug: "weather", title: "Preparing for Natural Disasters", slug: "preparing-for-natural-disasters",
    level: "B1", sortOrder: 6,
    passageText: "Living in a region prone to natural disasters such as earthquakes, floods, or hurricanes requires careful preparation. Experts recommend that every household keep an emergency kit containing water, food, a first aid kit, and important documents. It is also wise to have an evacuation plan and to know the location of the nearest emergency shelter. Staying informed through reliable news sources during a disaster is essential. Communities that prepare together are far more resilient when disaster strikes.",
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // HEALTH & BODY
  // ══════════════════════════════════════════════════════════════════════════════
  {
    topicSlug: "health", title: "I Feel Sick", slug: "i-feel-sick",
    level: "A1", sortOrder: 1,
    passageText: "Today I do not feel well. I have a headache and a sore throat. I am tired. My mother says I have a temperature. I stay in bed and drink water. I do not go to school. I hope I feel better tomorrow.",
  },
  {
    topicSlug: "health", title: "Staying Healthy", slug: "staying-healthy",
    level: "A1", sortOrder: 2,
    passageText: "I try to stay healthy. I eat fruit and vegetables every day. I drink a lot of water. I do not eat too much sugar. I play sport three times a week. I sleep for eight hours every night. My doctor says I am in good health.",
  },
  {
    topicSlug: "health", title: "At the Doctor's", slug: "at-the-doctors",
    level: "A2", sortOrder: 3,
    passageText: "Last week, Carlos went to see his doctor because he had a bad cough for several days. The doctor listened to his chest and asked him some questions. She said he had a mild chest infection and gave him some medicine. She also told him to rest and drink plenty of fluids. Carlos felt much better after five days.",
  },
  {
    topicSlug: "health", title: "Exercise and Mental Health", slug: "exercise-mental-health",
    level: "A2", sortOrder: 4,
    passageText: "Regular exercise is good not only for the body but also for the mind. When you exercise, your brain releases chemicals that improve your mood and reduce feelings of stress. Even a short walk of twenty minutes can make a difference. Studies show that people who exercise regularly tend to sleep better, feel more confident, and have more energy during the day. Doctors often recommend physical activity as part of treatment for anxiety and mild depression.",
  },
  {
    topicSlug: "health", title: "Understanding Mental Health", slug: "understanding-mental-health",
    level: "B1", sortOrder: 5,
    passageText: "Mental health is just as important as physical health, yet it is often misunderstood or ignored. Conditions such as anxiety, depression, and burnout affect millions of people worldwide. Many sufferers do not seek help because of the stigma attached to mental illness. Healthcare professionals encourage people to speak openly about their mental health, seek professional support when needed, and practise self-care routines such as regular sleep, exercise, and connecting with others. Early intervention leads to much better outcomes.",
  },
  {
    topicSlug: "health", title: "The Importance of Preventive Healthcare", slug: "preventive-healthcare",
    level: "B1", sortOrder: 6,
    passageText: "Preventive healthcare focuses on maintaining good health and preventing disease before it develops. Regular check-ups, vaccinations, health screenings, and a healthy lifestyle all play a role. Many serious conditions, including certain cancers, heart disease, and diabetes, can be detected early through routine tests, which significantly improves treatment outcomes. Despite this, many people only visit a doctor when they are already unwell. Health education and accessible healthcare systems are key to shifting this pattern.",
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // SHOPPING
  // ══════════════════════════════════════════════════════════════════════════════
  {
    topicSlug: "shopping", title: "At the Supermarket", slug: "at-the-supermarket",
    level: "A1", sortOrder: 1,
    passageText: "I go to the supermarket once a week. I use a shopping list so I do not forget anything. Today I need eggs, cheese, apples, and pasta. I put the items in my basket. At the checkout, I pay by card. The cashier gives me a receipt.",
  },
  {
    topicSlug: "shopping", title: "Buying a Gift", slug: "buying-a-gift",
    level: "A1", sortOrder: 2,
    passageText: "My friend's birthday is on Saturday. I go to the shop to buy a gift. I look at books, bags, and scarves. I choose a blue scarf because she loves blue. The shop assistant puts it in a nice box. I pay twenty dollars. I am happy with my choice.",
  },
  {
    topicSlug: "shopping", title: "At the Market", slug: "at-the-market",
    level: "A2", sortOrder: 3,
    passageText: "Every Sunday morning, there is an outdoor market in our town. Local farmers sell fresh fruit, vegetables, eggs, and homemade products. The prices are often cheaper than in supermarkets, and the quality is much better. Elena always goes to the market to buy tomatoes and herbs for the week. She also enjoys walking around, looking at handmade crafts and talking to the sellers. It is one of her favourite weekly activities.",
  },
  {
    topicSlug: "shopping", title: "Returning a Product", slug: "returning-a-product",
    level: "A2", sortOrder: 4,
    passageText: "David bought a pair of trainers online, but when they arrived they were the wrong size. He contacted the customer service team by email and explained the problem. They replied quickly and gave him instructions for returning the shoes. He sent them back in the original box and received a full refund within five days. David said the return process was easy and that he would shop with that company again.",
  },
  {
    topicSlug: "shopping", title: "Buying Clothes Online", slug: "buying-clothes-online",
    level: "B1", sortOrder: 5,
    passageText: "More and more people are choosing to buy clothes online instead of visiting physical shops. It is convenient because you can compare prices and styles from different brands without leaving home. However, there are disadvantages too. You cannot try the clothes on before buying, and sometimes the size or colour looks different in real life than in the photo. Most online shops offer free returns, which makes the risk smaller.",
  },
  {
    topicSlug: "shopping", title: "Consumerism and Sustainable Shopping", slug: "sustainable-shopping",
    level: "B1", sortOrder: 6,
    passageText: "Modern consumerism encourages people to buy more than they need. Fast fashion, planned obsolescence, and constant advertising create a cycle of continuous purchasing. This has serious environmental consequences, including waste, pollution, and the depletion of natural resources. Growing numbers of consumers are responding by choosing sustainable alternatives: buying second-hand items, supporting ethical brands, and repairing rather than replacing products. Small individual choices, multiplied across millions of people, can have a meaningful collective impact.",
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // HOBBIES & SPORTS
  // ══════════════════════════════════════════════════════════════════════════════
  {
    topicSlug: "hobbies", title: "I Like Football", slug: "i-like-football",
    level: "A1", sortOrder: 1,
    passageText: "My favourite sport is football. I play football with my friends on Sundays. We play in the park near our school. I am the goalkeeper. My team has eight players. We train every Sunday morning. I love this sport.",
  },
  {
    topicSlug: "hobbies", title: "My Weekend", slug: "my-weekend",
    level: "A1", sortOrder: 2,
    passageText: "On weekends I relax and do fun activities. On Saturday morning I play basketball with my brother. In the afternoon I read books or listen to music. On Sunday I go to the market with my family. In the evening we have dinner together. I enjoy my weekends very much.",
  },
  {
    topicSlug: "hobbies", title: "An Adventure Holiday", slug: "an-adventure-holiday",
    level: "A2", sortOrder: 3,
    passageText: "Last summer, Marco and his sister went on an adventure holiday in the mountains. They hiked for three days along a beautiful trail. Each night they stayed in a small wooden cabin. The weather was good, but on the second day it rained heavily. They put on their waterproof jackets and continued walking. At the end of the trip, they agreed it was the best holiday they had ever had.",
  },
  {
    topicSlug: "hobbies", title: "Learning to Cook", slug: "learning-to-cook",
    level: "A2", sortOrder: 4,
    passageText: "Six months ago, Nina decided to learn how to cook. She started by watching simple recipe videos online. Then she practised making basic dishes at home every weekend. She made many mistakes at first — once she burned the rice and another time she added too much salt. But she kept trying and slowly improved. Now she can cook five or six different meals confidently, and her friends say her cooking is very good.",
  },
  {
    topicSlug: "hobbies", title: "The Benefits of a Hobby", slug: "benefits-of-hobby",
    level: "B1", sortOrder: 5,
    passageText: "Having a hobby is more beneficial than many people realise. Hobbies provide a way to switch off from work-related stress and engage in activities that bring genuine pleasure. Whether it is painting, gardening, playing a musical instrument, or practising a sport, hobbies help develop patience, creativity, and focus. Research also shows that people who regularly engage in hobbies tend to report higher levels of happiness and life satisfaction. Even spending just a few hours a week on a hobby can have a noticeable positive effect.",
  },
  {
    topicSlug: "hobbies", title: "Professional Sport and Society", slug: "professional-sport-society",
    level: "B1", sortOrder: 6,
    passageText: "Professional sport occupies a unique place in modern society. It brings people together across cultural and national boundaries, creating shared experiences and a sense of community. Top athletes are admired as role models, inspiring millions of young people to pursue active lifestyles. However, professional sport also faces criticism. Issues such as doping, corruption, and the enormous salaries of elite players raise questions about values and fairness. Despite these controversies, the passion that sport generates around the world shows no sign of diminishing.",
  },
];

async function main() {
  console.log("Seeding SpeakEasy database…");

  for (const topic of TOPICS) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: { name: topic.name, icon: topic.icon, sortOrder: topic.sortOrder },
      create: topic,
    });
  }
  console.log(`${TOPICS.length} topics seeded`);

  let seeded = 0;
  for (const lesson of LESSONS) {
    const topic = await prisma.topic.findUnique({ where: { slug: lesson.topicSlug } });
    if (!topic) { console.warn(`Topic not found: ${lesson.topicSlug}`); continue; }
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
    seeded++;
  }
  console.log(`${seeded} lessons seeded (${LESSONS.filter(l => l.level === "A1").length} A1, ${LESSONS.filter(l => l.level === "A2").length} A2, ${LESSONS.filter(l => l.level === "B1").length} B1)`);
  console.log("Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
