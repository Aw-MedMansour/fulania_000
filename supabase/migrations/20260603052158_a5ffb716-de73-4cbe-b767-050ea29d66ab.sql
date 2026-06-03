
-- 1) Complétions sur entrées existantes (politesse + salutations)
UPDATE public.dictionary_entries SET arabic='شكرا', english='Thank you', pronunciation='a djaa-raa-ma', example_pulaar='A jaaraama no feewi.', example_french='Merci beaucoup.' WHERE pulaar='A jaaraama';
UPDATE public.dictionary_entries SET arabic='عفوا', english='Excuse me / Sorry', pronunciation='atch-tcham', example_pulaar='Accam, mi nanaali.', example_french='Pardon, je n''ai pas entendu.' WHERE pulaar='Accam';
UPDATE public.dictionary_entries SET arabic='عفوا', english='Excuse me / Sorry', pronunciation='atch-tchou', example_pulaar='Achchu, mi yiilii.', example_french='Pardon, je me suis trompé.' WHERE pulaar='Achchu';
UPDATE public.dictionary_entries SET arabic='أشكرك', english='I thank you', pronunciation='mi yet-ti ma', example_pulaar='Mi yetti ma fii ballal ma.', example_french='Je te remercie pour ton aide.' WHERE pulaar='Mi yetti ma';
UPDATE public.dictionary_entries SET arabic='أحبك', english='I love you / I appreciate you', pronunciation='mi yi-dii ma', example_pulaar='Mi yiɗii ma no feewi.', example_french='Je t''aime beaucoup.' WHERE pulaar='Mi yiɗii ma';
UPDATE public.dictionary_entries SET arabic='من فضلك', english='Please', pronunciation='tin-no', example_pulaar='Tinno, addan kam ndiyam.', example_french='S''il te plaît, apporte-moi de l''eau.' WHERE pulaar='Tinno';
UPDATE public.dictionary_entries SET arabic='من فضلك', english='Please', pronunciation='ou-sé-ko', example_pulaar='Useko, ɓeydan kam seeɗa.', example_french='S''il te plaît, ajoute-moi un peu.' WHERE pulaar='Useko';
UPDATE public.dictionary_entries SET arabic='سامحني', english='Forgive me', pronunciation='yaa-fo mi', example_pulaar='Yaafo mi, mi yejjitii.', example_french='Pardonne-moi, j''ai oublié.' WHERE pulaar='Yaafo mi';
UPDATE public.dictionary_entries SET arabic='سنلتقي', english='We will meet again', pronunciation='enn n-den-tay', example_pulaar='En ndentay janngo, in chaa Allah.', example_french='À demain, si Dieu le veut.' WHERE pulaar='En ndentay';
UPDATE public.dictionary_entries SET arabic='ما اسمك؟', english='What is your name?', pronunciation='hol no inn-ne-tdaa', example_pulaar='Hol no innetɗaa? - Mi innetee Aamadu.', example_french='Comment t''appelles-tu ? - Je m''appelle Amadou.' WHERE pulaar='Hol no innetɗaa?';
UPDATE public.dictionary_entries SET arabic='من أين أنت؟', english='Where are you from?', pronunciation='hol to njè-ya-dhaa', example_pulaar='Hol to njeyaɗaa? - Mi jeyaa Senegaal.', example_french='D''où viens-tu ? - Je viens du Sénégal.' WHERE pulaar='Hol to njeyaɗaa?';
UPDATE public.dictionary_entries SET arabic='سلام', english='Peace', pronunciation='djam', example_pulaar='Jam waali?', example_french='As-tu passé la nuit en paix ?' WHERE pulaar='Jam';
UPDATE public.dictionary_entries SET arabic='هل أمضيت يوما طيبا؟', english='Did you spend the day in peace? (good evening)', pronunciation='djam gnal-li', example_pulaar='Jam ñalli? - Jam tan.', example_french='As-tu passé la journée en paix ? - Paix seulement.' WHERE pulaar='Jam ñalli';
UPDATE public.dictionary_entries SET arabic='سلام فقط', english='Peace only (reply)', pronunciation='djam tann', example_pulaar='Jam waali? - Jam tan.', example_french='As-tu bien dormi ? - Paix seulement.' WHERE pulaar='Jam tan';
UPDATE public.dictionary_entries SET arabic='هل أمضيت ليلة طيبة؟', english='Did you spend the night in peace? (good morning)', pronunciation='djam waa-li', example_pulaar='Jam waali? - Jam tan, a jaaraama.', example_french='As-tu bien dormi ? - Paix seulement, merci.' WHERE pulaar='Jam waali';
UPDATE public.dictionary_entries SET arabic='اسمي...', english='My name is...', pronunciation='mi inn-ne-tee', example_pulaar='Mi innetee Faatu.', example_french='Je m''appelle Fatou.' WHERE pulaar='Mi innetee...';
UPDATE public.dictionary_entries SET arabic='شكرا / إلى اللقاء', english='Goodbye / Thank you', pronunciation='ndjaa-raa-ma', example_pulaar='Njaaraama, en ndentay.', example_french='Merci, à la prochaine.' WHERE pulaar='Njaaraama';
UPDATE public.dictionary_entries SET arabic='كيف حالك؟', english='How are you?', pronunciation='no m-bad-daa', example_pulaar='No mbaɗɗaa? - Mi e jam.', example_french='Comment vas-tu ? - Je vais bien.' WHERE pulaar='No mbaɗ-ɗaa?';
UPDATE public.dictionary_entries SET arabic='كيف حالك؟', english='How are you?', pronunciation='no m-bad-daa', example_pulaar='No mbaɗɗaa hannde?', example_french='Comment vas-tu aujourd''hui ?' WHERE pulaar='No mbaɗɗaa?';
UPDATE public.dictionary_entries SET arabic='كيف حالكم؟', english='How are you all? (plural/formal)', pronunciation='no m-bad-don', example_pulaar='No mbaɗɗon? - Min e jam.', example_french='Comment allez-vous ? - Nous allons bien.' WHERE pulaar='No mbaɗɗon?';
UPDATE public.dictionary_entries SET arabic='شكرا لكم / مرحبا', english='Hello / Thank you (formal, plural)', pronunciation='on djaa-raa-ma', example_pulaar='On jaaraama no feewi.', example_french='Merci beaucoup à vous.' WHERE pulaar='On jaaraama';
UPDATE public.dictionary_entries SET arabic='لا بأس', english='Everything is fine (reply)', pronunciation='ta-na a-laa', example_pulaar='Tana alaa, Alla jaaraama.', example_french='Tout va bien, Dieu merci.' WHERE pulaar='Tana alaa';
UPDATE public.dictionary_entries SET arabic='هل كل شيء بخير؟', english='Is everything alright? (lit. no harm?)', pronunciation='ta-na a-laa', example_pulaar='Tana alaa to galle?', example_french='Tout va bien à la maison ?' WHERE pulaar='Tana alaa?';
UPDATE public.dictionary_entries SET arabic='ليمنحك الله السلام', english='May God grant you peace', pronunciation='yo alla hok-kou djam', example_pulaar='Yo Alla hokku jam e galle ma.', example_french='Que Dieu accorde la paix à ta famille.' WHERE pulaar='Yo Alla hokku jam';

-- 2) Nouvelles entrées (mêmes 4 langues + prononciation + exemple)
INSERT INTO public.dictionary_entries (pulaar, french, english, arabic, pronunciation, category, example_pulaar, example_french)
SELECT v.pulaar, v.french, v.english, v.arabic, v.pronunciation, v.category, v.example_pulaar, v.example_french
FROM (VALUES
  ('Jam hiiri', 'As-tu passé la soirée en paix ? (bonsoir)', 'Did you spend the evening in peace? (good evening)', 'هل أمضيت مساء طيبا؟', 'djam hii-ri', 'salutation', 'Jam hiiri? - Jam tan.', 'Bonsoir. - Paix seulement.'),
  ('Jam weeti', 'As-tu passé le matin en paix ? (bonjour)', 'Did you spend the morning in peace? (good morning)', 'هل أمضيت صباحا طيبا؟', 'djam wèè-ti', 'salutation', 'Jam weeti? - Jam tan.', 'Bonjour. - Paix seulement.'),
  ('Mbalen e jam', 'Bonne nuit', 'Good night', 'تصبح على خير', 'm-ba-lèn é djam', 'salutation', 'Mbalen e jam, en ndentay janngo.', 'Bonne nuit, à demain.'),
  ('Bismillaahi', 'Bienvenue / Au nom de Dieu', 'Welcome / In the name of God', 'بسم الله', 'bis-mil-laa-hi', 'politesse', 'Bismillaahi, naatu.', 'Bienvenue, entre.'),
  ('Mar hba', 'Bienvenue', 'Welcome', 'مرحبا', 'mar-ha-ba', 'politesse', 'Mar hba e galle amen.', 'Bienvenue dans notre maison.'),
  ('In chaa Allah', 'Si Dieu le veut', 'God willing', 'إن شاء الله', 'in-chaa al-la', 'expression', 'En ndentay janngo, in chaa Allah.', 'À demain, si Dieu le veut.'),
  ('Alhamdulillaahi', 'Louange à Dieu', 'Praise be to God', 'الحمد لله', 'al-ham-dou-lil-laa-hi', 'expression', 'Mi e jam, alhamdulillaahi.', 'Je vais bien, louange à Dieu.'),
  ('Maa chaa Allah', 'Que Dieu bénisse', 'God has willed it', 'ما شاء الله', 'maa-chaa al-la', 'expression', 'Maa chaa Allah, ɓiɗɗo ma yooɗii.', 'Que Dieu bénisse, ton enfant est beau.'),
  ('Baaba', 'Papa / Père', 'Dad / Father', 'أبي', 'baa-ba', 'famille', 'Baaba am no e galle.', 'Mon père est à la maison.'),
  ('Yumma', 'Maman / Mère', 'Mom / Mother', 'أمي', 'youm-ma', 'famille', 'Yumma am no defa.', 'Ma mère est en train de cuisiner.'),
  ('Mawɗo', 'Aîné / Grand', 'Elder / Senior', 'الأكبر', 'maw-do', 'famille', 'Mawɗo am ko Aamadu.', 'Mon aîné c''est Amadou.'),
  ('Minyiraaɗo', 'Cadet / Petit frère', 'Younger sibling', 'الأصغر', 'mi-gni-raa-do', 'famille', 'Minyiraaɗo am no jangoo.', 'Mon petit frère étudie.'),
  ('Musiɗɗo', 'Ami', 'Friend', 'صديق', 'mou-sid-do', 'social', 'O ko musiɗɗo am.', 'C''est mon ami.'),
  ('Kawu', 'Oncle (paternel)', 'Uncle (paternal)', 'عم', 'ka-wou', 'famille', 'Kawu am arii hannde.', 'Mon oncle est venu aujourd''hui.'),
  ('Goggo', 'Tante', 'Aunt', 'عمة / خالة', 'gog-go', 'famille', 'Goggo am yiɗi ma.', 'Ma tante t''aime.'),
  ('Mi weltii', 'Je suis content', 'I am happy', 'أنا سعيد', 'mi wèl-tii', 'expression', 'Mi weltii e yiide ma.', 'Je suis content de te voir.'),
  ('Mi heɓii', 'J''ai compris / J''ai eu', 'I got it / I understood', 'فهمت', 'mi hé-bii', 'expression', 'Mi heɓii ko mbi''ɗaa.', 'J''ai compris ce que tu as dit.'),
  ('Mi anndaa', 'Je ne sais pas', 'I don''t know', 'لا أعرف', 'mi ann-daa', 'expression', 'Mi anndaa to o woni.', 'Je ne sais pas où il est.'),
  ('Mi faamii', 'J''ai compris', 'I understood', 'فهمت', 'mi faa-mii', 'expression', 'Mi faamii ko jannginiɗaa kam.', 'J''ai compris ce que tu m''as appris.'),
  ('Hol no?', 'Comment ?', 'How?', 'كيف؟', 'hol no', 'question', 'Hol no innetee?', 'Comment ça s''appelle ?'),
  ('Hol to?', 'Où ?', 'Where?', 'أين؟', 'hol to', 'question', 'Hol to njahataa?', 'Où vas-tu ?'),
  ('Hol ko?', 'Quoi ?', 'What?', 'ماذا؟', 'hol ko', 'question', 'Hol ko ngolloɗaa?', 'Que fais-tu ?'),
  ('Hol mo?', 'Qui ?', 'Who?', 'من؟', 'hol mo', 'question', 'Hol mo arii?', 'Qui est venu ?'),
  ('Hol nde?', 'Quand ?', 'When?', 'متى؟', 'hol n-dé', 'question', 'Hol nde nguartaa?', 'Quand reviens-tu ?'),
  ('Sabu', 'Parce que / À cause de', 'Because', 'لأن', 'sa-bou', 'conjonction', 'Mi yaadaali sabu nguleeki.', 'Je n''y suis pas allé à cause de la chaleur.'),
  ('Si', 'Si (condition)', 'If', 'إذا', 'si', 'conjonction', 'Si a arii, noddu mi.', 'Si tu viens, appelle-moi.'),
  ('Hannde', 'Aujourd''hui', 'Today', 'اليوم', 'han-dé', 'temps', 'Hannde ko Aaɓnde.', 'Aujourd''hui c''est lundi.'),
  ('Janngo', 'Demain', 'Tomorrow', 'غدا', 'djan-go', 'temps', 'Janngo en ndentay.', 'À demain.'),
  ('Hanki', 'Hier', 'Yesterday', 'أمس', 'han-ki', 'temps', 'Hanki mi yahii luumo.', 'Hier je suis allé au marché.'),
  ('Jooni', 'Maintenant', 'Now', 'الآن', 'djoo-ni', 'temps', 'Aru jooni!', 'Viens maintenant !'),
  ('Jooni jooni', 'Tout de suite', 'Right now', 'حالا', 'djoo-ni djoo-ni', 'temps', 'Mi arat jooni jooni.', 'J''arrive tout de suite.'),
  ('Subaka', 'Matin', 'Morning', 'صباح', 'sou-ba-ka', 'temps', 'Subaka mun mi immotoo law.', 'Le matin je me lève tôt.'),
  ('Kikiiɗe', 'Après-midi / Soir', 'Afternoon / Evening', 'بعد الظهر', 'ki-kii-dé', 'temps', 'Kikiiɗe en pijirta.', 'L''après-midi on jouera.'),
  ('Jamma', 'Nuit', 'Night', 'ليل', 'djam-ma', 'temps', 'Jamma jooɗii.', 'La nuit est tombée.'),
  ('Ndiyam', 'Eau', 'Water', 'ماء', 'n-di-yam', 'nature', 'Yarude ndiyam ko moƴƴi.', 'Boire de l''eau, c''est bon.'),
  ('Ñaamde', 'Manger / Nourriture', 'To eat / Food', 'يأكل / طعام', 'gnaam-dé', 'cuisine', 'Aru ñaamen.', 'Viens, mangeons.'),
  ('Yarde', 'Boire', 'To drink', 'يشرب', 'yar-dé', 'verbe', 'Mi yari ataaye.', 'J''ai bu du thé.'),
  ('Galle', 'Maison / Famille', 'Home / Household', 'بيت / عائلة', 'gal-lé', 'famille', 'Galle amen no woɗɗi.', 'Notre maison est loin.'),
  ('Suudu', 'Chambre / Pièce', 'Room', 'غرفة', 'sou-dou', 'maison', 'Suudu am no laaɓi.', 'Ma chambre est propre.'),
  ('Laawol', 'Chemin / Route', 'Path / Road', 'طريق', 'laa-wol', 'nature', 'Laawol ngol no juuti.', 'Le chemin est long.'),
  ('Hooram', 'Soi-même', 'Oneself', 'نفسه', 'hoo-ram', 'pronom', 'O huuɓtanii hoore mun.', 'Il s''est occupé de lui-même.'),
  ('Sehil', 'Camarade / Compagnon', 'Companion / Mate', 'رفيق', 'sé-hil', 'social', 'Sehil am ko o.', 'C''est mon camarade.'),
  ('Yo Alla yurmo ma', 'Que Dieu te fasse miséricorde', 'May God have mercy on you', 'يرحمك الله', 'yo alla your-mo ma', 'politesse', 'Yo Alla yurmo ma e galle ma.', 'Que Dieu te bénisse, toi et ta famille.'),
  ('Barka', 'Bénédiction / Merci', 'Blessing / Thanks', 'بركة', 'bar-ka', 'politesse', 'Barka Alla e ballal ma.', 'Que Dieu te bénisse pour ton aide.'),
  ('Mi salii', 'J''ai refusé', 'I refused', 'رفضت', 'mi sa-lii', 'expression', 'Mi salii yahde.', 'J''ai refusé d''y aller.')
) AS v(pulaar, french, english, arabic, pronunciation, category, example_pulaar, example_french)
WHERE NOT EXISTS (SELECT 1 FROM public.dictionary_entries d WHERE d.pulaar = v.pulaar);
