-- ============================================
-- Data Import: akachanlist
-- ============================================
-- This migration inserts all the akachanlist data into the database.
-- Generated from items-zh.json and items-ja.json
-- Date: 2026-03-23
-- ============================================

-- ============================================
-- Projects
-- ============================================
INSERT INTO projects (id, slug, name_zh, name_ja, description_zh, description_ja)
VALUES
  (gen_random_uuid(), 'akachanlist', '宝宝清单', '作ろう！めばえリスト', '基于日本赤ちゃん本舗的推荐清单', 'アカチャンホンポの推奨リストに基づく');

-- ============================================
-- Categories
-- ============================================
INSERT INTO categories (id, project_id, slug, name_zh, name_ja, icon, sort_order)
VALUES
  (gen_random_uuid(), (SELECT id FROM projects WHERE slug = 'akachanlist'), 'maternity-mama', '孕产妇用品', 'マタニティ＆ママ', 'user', 1),
  (gen_random_uuid(), (SELECT id FROM projects WHERE slug = 'akachanlist'), 'baby-0-3m', '婴儿用品（0-3个月）', '赤ちゃん（0〜3ヶ月）', 'baby', 2),
  (gen_random_uuid(), (SELECT id FROM projects WHERE slug = 'akachanlist'), 'baby-3-6m', '婴儿用品（3-6个月）', '赤ちゃん（3〜6ヶ月）', 'smile', 3),
  (gen_random_uuid(), (SELECT id FROM projects WHERE slug = 'akachanlist'), 'outing', '外出用品', 'おでかけ', 'car', 4);

-- ============================================
-- Subcategories - Maternity & Mama
-- ============================================
INSERT INTO subcategories (id, category_id, slug, name_zh, name_ja, description_zh, description_ja, sort_order)
VALUES
  -- Prenatal
  (gen_random_uuid(), (SELECT id FROM categories WHERE slug = 'maternity-mama' AND project_id = (SELECT id FROM projects WHERE slug = 'akachanlist')), 'prenatal', '产前用品', '産前用品', '妊娠初期至后期的必需品', '妊娠初期から後期までの必需品', 1),
  -- Hospital
  (gen_random_uuid(), (SELECT id FROM categories WHERE slug = 'maternity-mama' AND project_id = (SELECT id FROM projects WHERE slug = 'akachanlist')), 'hospital', '入院准备用品', '入院準備用品', '分娩住院时需要的物品', '出産入院時に必要なアイテム', 2),
  -- Postpartum
  (gen_random_uuid(), (SELECT id FROM categories WHERE slug = 'maternity-mama' AND project_id = (SELECT id FROM projects WHERE slug = 'akachanlist')), 'postpartum', '产后用品', '産後用品', '产后恢复期需要的物品', '産後の回復期に必要なアイテム', 3);

-- ============================================
-- Subcategories - Baby 0-3 months
-- ============================================
INSERT INTO subcategories (id, category_id, slug, name_zh, name_ja, description_zh, description_ja, sort_order)
VALUES
  -- Clothing
  (gen_random_uuid(), (SELECT id FROM categories WHERE slug = 'baby-0-3m' AND project_id = (SELECT id FROM projects WHERE slug = 'akachanlist')), 'clothing', '衣物', 'ベビーウェア', '新生儿需要的衣物', '新生児に必要な衣服', 1),
  -- Diapers
  (gen_random_uuid(), (SELECT id FROM categories WHERE slug = 'baby-0-3m' AND project_id = (SELECT id FROM projects WHERE slug = 'akachanlist')), 'diapers', '纸尿裤相关', 'おむつ関連', '纸尿裤和护理用品', 'おむつとケア用品', 2),
  -- Feeding
  (gen_random_uuid(), (SELECT id FROM categories WHERE slug = 'baby-0-3m' AND project_id = (SELECT id FROM projects WHERE slug = 'akachanlist')), 'feeding', '哺乳用品', '授乳・調乳', '哺乳和喂养相关', '授乳とミルク関連', 3),
  -- Bathing
  (gen_random_uuid(), (SELECT id FROM categories WHERE slug = 'baby-0-3m' AND project_id = (SELECT id FROM projects WHERE slug = 'akachanlist')), 'bathing', '洗澡用品', 'おふろ・ベビーケア', '婴儿洗澡和护理', '赤ちゃんのお風呂とケア', 4),
  -- Sleeping
  (gen_random_uuid(), (SELECT id FROM categories WHERE slug = 'baby-0-3m' AND project_id = (SELECT id FROM projects WHERE slug = 'akachanlist')), 'sleeping', '睡眠用品', 'ねんね・おへや', '婴儿睡眠相关', '赤ちゃんの睡眠関連', 5);

-- ============================================
-- Subcategories - Baby 3-6 months
-- ============================================
INSERT INTO subcategories (id, category_id, slug, name_zh, name_ja, description_zh, description_ja, sort_order)
VALUES
  -- Clothing 3-6m
  (gen_random_uuid(), (SELECT id FROM categories WHERE slug = 'baby-3-6m' AND project_id = (SELECT id FROM projects WHERE slug = 'akachanlist')), 'clothing-3-6m', '衣物', 'ベビーウェア', '3-6个月婴儿衣物', '3〜6ヶ月のベビー服', 1),
  -- Toys
  (gen_random_uuid(), (SELECT id FROM categories WHERE slug = 'baby-3-6m' AND project_id = (SELECT id FROM projects WHERE slug = 'akachanlist')), 'toys', '玩具', 'おもちゃ', '3-6个月适合的玩具', '3〜6ヶ月向けのおもちゃ', 2);

-- ============================================
-- Subcategories - Outing
-- ============================================
INSERT INTO subcategories (id, category_id, slug, name_zh, name_ja, description_zh, description_ja, sort_order)
VALUES
  -- Stroller
  (gen_random_uuid(), (SELECT id FROM categories WHERE slug = 'outing' AND project_id = (SELECT id FROM projects WHERE slug = 'akachanlist')), 'stroller', '婴儿车', 'ベビーカー', '1个月健康检查结束后可以慢慢外出', '1ヶ月健診が終わったらゆっくりお出かけできます', 1),
  -- Car Seat
  (gen_random_uuid(), (SELECT id FROM categories WHERE slug = 'outing' AND project_id = (SELECT id FROM projects WHERE slug = 'akachanlist')), 'car-seat', '汽车安全座椅', 'チャイルドシート', '车载6岁以下儿童必须使用，出院时就需要', '6歳未満の車載時は使用義務、退院時に必要', 2),
  -- Baby Carrier
  (gen_random_uuid(), (SELECT id FROM categories WHERE slug = 'outing' AND project_id = (SELECT id FROM projects WHERE slug = 'akachanlist')), 'baby-carrier', '婴儿背带', 'ベビーキャリア・スリング', '不仅外出时，在家哄宝宝时也很方便', 'お出かけ時だけでなく、家で赤ちゃんをあやす時にも便利', 3);

-- ============================================
-- Items - Prenatal (产前用品)
-- ============================================
INSERT INTO items (id, subcategory_id, name_zh, name_ja, description_zh, description_ja, priority, quantity_zh, quantity_ja, notes_zh, notes_ja, sort_order)
VALUES
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'prenatal'), '补充剂·食品', 'サプリメント・食品', '妊娠初期（~4个月）- 产前产后容易缺乏的营养素可以通过补充剂和饮料摄入', '妊娠初期（〜4ヶ月） - 産前・産後に不足しがちな栄養素はサプリやドリンクで摂取してもOK。妊娠中も飲めるノンカフェイン飲料もあります。', 'recommended', '按需准备', '必要なものを', '叶酸、铁、钙等', '葉酸、鉄、カルシウム等', 1),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'prenatal'), '母子手册夹', 'マルチケース（母子手帳ケース）', '不仅可以装母子手册，还能统一管理孕妇健康检查辅助券和预防接种所需的文件', '母子手帳だけでなく、妊婦健診補助券や予防接種に必要な書類もまとめて管理できます。', 'required', '1个', '1個', NULL, NULL, 2),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'prenatal'), '孕妇身体护理霜', 'マタニティボディケアクリーム', '妊娠中期（5-7个月）- 妊娠后皮肤变敏感、容易干燥，需要在肚子变大前尽早开始护肤', '妊娠中期（5〜7ヶ月） - 妊娠すると肌が敏感になったり、乾燥しやすくなります。おなかが大きくなる前からの早めのスキンケアが大切です。', 'required', '1-2瓶', '1〜2本', NULL, NULL, 3),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'prenatal'), '孕妇内裤', 'マタニティショーツ', '妊娠中期（5-7个月）- 包腹型可以紧紧包住腹部，保护妈妈和肚子里的宝宝不受寒冷侵袭', '妊娠中期（5〜7ヶ月） - おなかすっぽりタイプは、おなかをしっかり包み込み、ママとおなかの中の赤ちゃんを冷えから守ります。', 'required', '3-4件', '3〜4枚', NULL, NULL, 4),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'prenatal'), '孕妇文胸·半上衣', 'マタニティブラジャー・ハーフトップ', '妊娠中期（5-7个月）- 产前产后都可以长期使用，穿着文胸也能授乳的便利功能', '妊娠中期（5〜7ヶ月） - 産前から産後まで長く使え、ブラジャー着けたまま授乳ができる便利な機能付きです。', 'required', '3-4件', '3〜4枚', NULL, NULL, 5),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'prenatal'), '吊带背心·坦克背心', 'キャミソール・タンクトップ', '妊娠中期（5-7个月）- 穿文胸难受时可以用带胸垫的内衣放松，秋冬还有8分袖内衣', '妊娠中期（5〜7ヶ月） - ブラがつらいときはカップ付きインナーでリラックス。秋冬には8分袖インナーもあります。', 'required', '2-3件', '2〜3枚', NULL, NULL, 6),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'prenatal'), '孕妇带（腹带）', '妊婦帯：にんぷたい（腹帯：はらおび）', '妊娠中期（5-7个月）- 保护腹部不受寒冷侵袭，支撑腹部所必需的物品', '妊娠中期（5〜7ヶ月） - おなかを冷えから守ったり、おなかを支えるのに必要なアイテム。', 'required', '2-3条', '2〜3枚', NULL, NULL, 7),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'prenatal'), '腹卷', 'はらまき', '妊娠中期（5-7个月）- 温柔地包裹腹部，推荐用于防止受寒', '妊娠中期（5〜7ヶ月） - 優しくおなかを包み込み、冷えから守るのにおすすめのアイテム。', 'recommended', '1-2条', '1〜2枚', NULL, NULL, 8),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'prenatal'), '抱枕', '抱き枕', '妊娠中期（5-7个月）- 产前作为抱枕，支持难受的姿势帮助放松；产后可作为授乳枕长期使用', '妊娠中期（5〜7ヶ月） - 産前は抱き枕として、寝苦しい体勢をサポートして、リラックスできます。産後は授乳クッションとして長く使えます。', 'recommended', '1个', '1個', NULL, NULL, 9),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'prenatal'), '孕妇装', 'マタニティウェア', '妊娠中期（5-7个月）- 温柔包裹腹部，产前产后都能穿着且活动方便的衣服', '妊娠中期（5〜7ヶ月） - おなかを優しく包み込み、産前産後ともに着用でき、動きやすいウェア。', 'required', '3-4件', '3〜4枚', NULL, NULL, 10),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'prenatal'), '孕妇用打底裤·连裤袜·长筒袜', 'マタニティレギンス・ストッキング・タイツ', '妊娠中期（5-7个月）- 感到平时的物品紧绷时使用。胯部宽松适合变大的腹部，穿着舒适', '妊娠中期（5〜7ヶ月） - 普段のものがきついと感じた時に使用。股上が深く、大きくなったおなかにも快適に着用できます。', 'recommended', '3-4件', '3〜4枚', NULL, NULL, 11),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'prenatal'), '家居服', 'ルームウェア', '妊娠中期（5-7个月）- 腹部宽松的家居服可以放松，产前产后都能使用', '妊娠中期（5〜7ヶ月） - おなか周りがゆったりしたルームウェアでリラックス。産前産後使えます。', 'recommended', '1-2件', '1〜2枚', NULL, NULL, 12),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'prenatal'), '妈妈包', 'ママバッグ', '妊娠后期（8-10个月）- 妊娠期间就能使用，可装住院用品，产后可作为宝宝外出的包', '妊娠後期（8〜10ヶ月） - 妊娠中から使えて、入院用品も入る大きさ。産後は赤ちゃんのお出かけバッグとして使えます。', 'recommended', '1个', '1個', NULL, NULL, 13),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'prenatal'), '圆座垫', 'ドーナツクッション', '妊娠后期（8-10个月）- 温柔支持产前产后妈妈的臀部', '妊娠後期（8〜10ヶ月） - 産前産後のママのお尻を優しくサポート。', 'recommended', '1个', '1個', NULL, NULL, 14),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'prenatal'), '吸水护理垫', '吸水ケアパッド', '妊娠后期（8-10个月）- 妊娠中产后膀胱受压迫等可能会经历尿漏，使用吸水性强且有消臭效果的专用垫', '妊娠後期（8〜10ヶ月） - 妊娠中や産後、膀胱が圧迫されるなどして尿漏れを経験することがあります。吸水性が高く消臭効果のある専用パッドを使用。', 'recommended', '1包', '1袋', NULL, NULL, 15);

-- ============================================
-- Items - Hospital (入院准备用品)
-- ============================================
INSERT INTO items (id, subcategory_id, name_zh, name_ja, description_zh, description_ja, priority, quantity_zh, quantity_ja, notes_zh, notes_ja, sort_order)
VALUES
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'hospital'), '孕妇睡衣', 'マタニティパジャマ', '可以宽松穿着，住院时检查也方便的长度是特点。也有适合剖腹产的连衣裙型、不上卷的爬行型、全开型、授乳口型', 'ゆったり着用でき、入院中の検査でも便利な長さが特徴。帝王切開用のワンピース型、はだけにくいクロッチタイプ、フルオープン型、授乳口付きタイプなどがあります。', 'required', '2-3件', '2〜3枚', '有些医院会准备，请确认后准备必要数量', '病院によって用意されている場合があります。確認して必要な分を用意してください', 1),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'hospital'), '产后内裤', '産後ショーツ', '胯部开口的防水规格内裤。住院检查时和更换产褥垫时可以躺着更换，很方便', '股部分が開く防水仕様のショーツ。入院中の検査時や産褥パッドの交換時に寝たまま交換できて便利。', 'required', '3-4件', '3〜4枚', '有些医院会准备，请确认后准备必要数量', '病院によって用意されている場合があります。確認して必要な分を用意してください', 2),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'hospital'), '骨盆带·骨盆内裤（产后立即）', '骨盤ベルト・骨盤ショーツ（産後すぐ）', '支持产后骨盆的带子', '産後の骨盤をサポートするベルト。', 'required', '1-2件', '1〜2枚', '有些医院会准备，请确认后准备必要数量', '病院によって用意されている場合があります。確認して必要な分を用意してください', 3),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'hospital'), '产褥垫', '産褥パッド', '用于吸收破水时的羊水和产后恶露。从大尺寸逐渐使用小尺寸', '破水時の羊水や産後の悪露を吸収するためのもの。大きいサイズから徐々に小さいサイズを使います。', 'required', '2-3包', '2〜3袋', '有些医院会准备，请确认后准备必要数量', '病院によって用意されている場合があります。確認して必要な分を用意してください', 4),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'hospital'), '防溢乳垫', '授乳パッド', '防止母乳漏出，保护乳房和乳头。根据产后母乳分泌情况追加购买', '母乳の漏れを防ぎ、乳房や乳首を保護。産後の母乳分泌状況に応じて追加購入。', 'required', '1包', '1袋', '也有可重复使用的布制类型', '繰り返し使える布タイプもあります', 5),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'hospital'), '吸管杯', 'ストローマグ', '躺着也能摄取水分的便利物品。阵痛时、分娩中、以及产后无法活动时发挥作用', '寝たまま水分補給ができる便利なアイテム。陣痛時、出産中、産後で動けない時に活躍。', 'required', '1个', '1個', NULL, NULL, 6),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'hospital'), '乳头护理霜', '乳首ケアクリーム', '缓解授乳中敏感乳头的麻烦，保护皮肤的专用霜', '授乳中に敏感になる乳首のトラブルをやわらげ、皮膚を保護する専用クリーム。', 'recommended', '1支', '1個', NULL, NULL, 7),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'hospital'), '全开产褥内裤（剖腹产用）', 'フルオープン産褥ショーツ（帝王切開用）', '胯部和腹部都能开口，躺着就能更换产褥垫，术后处理时也很方便', '股部分と腹部が開き、寝たまま産褥パッドの交換が可能。手術後の処置時も便利。', 'recommended', '3-4件', '3〜4枚', NULL, NULL, 8),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'hospital'), '腹部保护带（剖腹产用）', '腹部保護帯（帝王切開用）', '温柔地覆盖剖腹产后的伤口', '帝王切開後の傷を優しく覆う。', 'recommended', '1条', '1本', NULL, NULL, 9);

-- ============================================
-- Items - Postpartum (产后用品)
-- ============================================
INSERT INTO items (id, subcategory_id, name_zh, name_ja, description_zh, description_ja, priority, quantity_zh, quantity_ja, notes_zh, notes_ja, sort_order)
VALUES
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'postpartum'), '塑身内裤', 'シェイプアップショーツ', '产后1个月左右 - 高腰设计包裹腹部，收紧腰部到臀部整体', '産後1ヶ月頃 - ハイウエスト設計で腹部を包み込み、ウエストからヒップ全体を引き締める。', 'recommended', '1-2件', '1〜2枚', NULL, NULL, 1),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'postpartum'), '授乳披风', '授乳ケープ', '外出授乳时披风很方便。住院期间或家里来客时的授乳也很便利', 'お出かけ時の授乳にケープがあると便利。入院中や家に来客時の授乳にも便利。', 'recommended', '1件', '1枚', NULL, NULL, 2),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'postpartum'), '压力袜', '弾性ストッキング', '推荐穿只需穿着就能护理产后脚部浮肿的袜子', 'はくだけで産後の足のむくみケアができるソックスがおすすめ。', 'recommended', '1件', '1枚', NULL, NULL, 3);

-- ============================================
-- Items - Clothing (衣物)
-- ============================================
INSERT INTO items (id, subcategory_id, name_zh, name_ja, description_zh, description_ja, priority, quantity_zh, quantity_ja, notes_zh, notes_ja, sort_order)
VALUES
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'clothing'), '短内衣', '短肌着', '最接近肌肤的衣摆较短的基本内衣。吸收颈部和腋下的汗水保持清洁', '肌に一番近着る、裾が短い基本の肌着。首やわきの汗を吸って清潔に保つ。', 'required', '3件以上', '3枚以上', NULL, NULL, 1),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'clothing'), '长内衣', '長肌着', '衣长到膝盖的长内衣。穿在短内衣上，根据气温和季节调节', '裾が膝まである長い肌着。短肌着の上に着せ、気温や季節に合わせて調節。', 'required', '5件以上', '5枚以上', NULL, NULL, 2),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'clothing'), '连体衣（50-60cm）', 'コンビネーション（50-60cm）', '上下连着的内衣。根据季节有时只穿1件内衣，脚部活动活跃后改用连体衣的人增多', '上下がつながった肌着。季節によっては肌着1枚で過ごすことも。足が動き出すとコンビネーションに切り替える人も多い。', 'recommended', '2件以上', '2枚以上', NULL, NULL, 3),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'clothing'), '连衣裙（两用）', 'ツーウェイオール', '穿在内衣上的衣服。新生儿时期作为连衣裙，脚部活动活跃时可以分开胯部穿着', '肌着の上に着せるベビー服。新生児期はワンピースとして、足が動き出したら股下を留めて着ることができます。', 'required', '2-3件', '2〜3枚', NULL, NULL, 4),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'clothing'), '围兜', 'よだれかけ', '防止牛奶吐出或口水弄脏衣服，也可作为时尚单品', 'ミルクの吐き戻しやよだれで服が汚れるのを防ぐ。ファッションアイテムとしても。', 'recommended', '按需准备', '必要な分', NULL, NULL, 5),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'clothing'), '纱布手帕', 'ガーゼハンカチ', '洗澡、授乳时、擦口水等多用途使用，有多少都不嫌多', 'お風呂、授乳時、よだれ拭きなど多用途に使えて、何あっても困らない。', 'required', '10条以上', '10枚以上', NULL, NULL, 6),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'clothing'), '婴儿手套', 'ベビーミトン', '防止宝宝摸脸时用指甲伤到自己', '赤ちゃんが顔を触った時に爪で自分を傷つけないようにするため。', 'recommended', '1-2组', '1〜2組', NULL, NULL, 7),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'clothing'), '婴儿袜子', 'ベビーソックス', '保暖用', '防寒用。', 'recommended', '2-3双', '2〜3足', NULL, NULL, 8),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'clothing'), '婴儿帽子', 'ベビーキャップ', '保暖用', '防寒用。', 'recommended', '1-2个', '1〜2個', NULL, NULL, 9);

-- ============================================
-- Items - Diapers (纸尿裤相关)
-- ============================================
INSERT INTO items (id, subcategory_id, name_zh, name_ja, description_zh, description_ja, priority, quantity_zh, quantity_ja, notes_zh, notes_ja, sort_order)
VALUES
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'diapers'), '新生儿纸尿裤（NB）', '新生児用おむつ（NB）', '新生儿专用', '新生児専用。', 'required', '1-2包', '1〜2袋', NULL, NULL, 1),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'diapers'), '纸尿裤（S号）', 'おむつ（Sサイズ）', '成长后使用', '成長したら使用。', 'required', '1-2包', '1〜2袋', NULL, NULL, 2),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'diapers'), '婴儿湿巾', 'おしりふき', '清洁用', '清拭用。', 'required', '若干包', '数袋', NULL, NULL, 3),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'diapers'), '护臀膏', 'おむつかぶれ防止クリーム', '预防尿布疹', 'おむつかぶれの予防。', 'required', '1支', '1個', NULL, NULL, 4);

-- ============================================
-- Items - Feeding (哺乳用品)
-- ============================================
INSERT INTO items (id, subcategory_id, name_zh, name_ja, description_zh, description_ja, priority, quantity_zh, quantity_ja, notes_zh, notes_ja, sort_order)
VALUES
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'feeding'), '奶瓶', '哺乳瓶', '160ml、240ml', '160ml、240ml。', 'required', '各2-3个', '各2〜3個', NULL, NULL, 1),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'feeding'), '奶嘴', '乳首', '备用奶嘴', '予备用。', 'required', '3-5个', '3〜5個', NULL, NULL, 2),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'feeding'), '奶粉', '粉ミルク', '以备不时之需', 'いざという時に備えて。', 'recommended', '1罐', '1缶', NULL, NULL, 3),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'feeding'), '哺乳枕', '授乳クッション', '哺乳时支撑手臂', '授乳時に腕を支える。', 'recommended', '1个', '1個', NULL, NULL, 4);

-- ============================================
-- Items - Bathing (洗澡用品)
-- ============================================
INSERT INTO items (id, subcategory_id, name_zh, name_ja, description_zh, description_ja, priority, quantity_zh, quantity_ja, notes_zh, notes_ja, sort_order)
VALUES
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'bathing'), '婴儿浴盆', 'ベビーバス', '婴儿专用浴盆', '赤ちゃん専用の沐浴用。', 'required', '1个', '1個', NULL, NULL, 1),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'bathing'), '婴儿沐浴露', 'ベビー石鹸', '温和无刺激', '低刺激・無添加。', 'required', '1瓶', '1個', NULL, NULL, 2),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'bathing'), '婴儿洗发水', 'ベビーシャンプー', '温和无刺激', '低刺激・無添加。', 'required', '1瓶', '1個', NULL, NULL, 3),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'bathing'), '婴儿毛巾', 'ベビーバスタオル', '柔软吸水', '柔らかく吸水性が高い。', 'required', '3-4条', '3〜4枚', NULL, NULL, 4),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'bathing'), '水温计', '水温計', '测量洗澡水温度', 'お湯の温度を測る。', 'recommended', '1个', '1個', NULL, NULL, 5);

-- ============================================
-- Items - Sleeping (睡眠用品)
-- ============================================
INSERT INTO items (id, subcategory_id, name_zh, name_ja, description_zh, description_ja, priority, quantity_zh, quantity_ja, notes_zh, notes_ja, sort_order)
VALUES
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'sleeping'), '婴儿床', 'ベビーベッド', '安全标准认证', '安全基準認証取得品。', 'required', '1个', '1台', NULL, NULL, 1),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'sleeping'), '床垫', 'マットレス', '符合婴儿床尺寸', 'ベビーベッドに合ったサイズ。', 'required', '1个', '1個', NULL, NULL, 2),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'sleeping'), '床品套装', '寝具セット', '床单、被套等', 'シーツ、カバーなど。', 'required', '2-3套', '2〜3セット', NULL, NULL, 3),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'sleeping'), '睡袋', 'スリーパー', '根据季节选择厚度', '季節に合わせて厚さを選択。', 'recommended', '1-2个', '1〜2個', NULL, NULL, 4);

-- ============================================
-- Items - Clothing 3-6m (衣物 3-6个月)
-- ============================================
INSERT INTO items (id, subcategory_id, name_zh, name_ja, description_zh, description_ja, priority, quantity_zh, quantity_ja, notes_zh, notes_ja, sort_order)
VALUES
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'clothing-3-6m'), '婴儿衣服（70-80cm）', 'ベビー服（70-80cm）', '活动量增加，需要更多衣服', '活動量が増え、服の枚数も多く必要に。', 'required', '7-10件', '7〜10枚', NULL, NULL, 1);

-- ============================================
-- Items - Toys (玩具)
-- ============================================
INSERT INTO items (id, subcategory_id, name_zh, name_ja, description_zh, description_ja, priority, quantity_zh, quantity_ja, notes_zh, notes_ja, sort_order)
VALUES
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'toys'), '摇铃', 'ガラガラ', '促进听觉发育', '聴覚の発達を促進。', 'recommended', '2-3个', '2〜3個', NULL, NULL, 1),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'toys'), '布书', '布の絵本', '触觉和视觉刺激', '触覚と視覚の刺激。', 'recommended', '3-5本', '3〜5冊', NULL, NULL, 2),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'toys'), '健身架', 'プレイジム', '促进运动发育', '運動発達を促進。', 'recommended', '1个', '1台', NULL, NULL, 3);

-- ============================================
-- Items - Stroller (婴儿车)
-- ============================================
INSERT INTO items (id, subcategory_id, name_zh, name_ja, description_zh, description_ja, priority, quantity_zh, quantity_ja, notes_zh, notes_ja, sort_order)
VALUES
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'stroller'), '婴儿车', 'ベビーカー', '根据交通工具、常去的地方、家里的收纳空间等生活方式选择好用的物品', '乗り物、よく行く場所、家の収納スペースなどライフスタイルに合わせて使いやすいものを選びましょう。', 'required', '1台', '1台', NULL, NULL, 1),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'stroller'), '婴儿车小物件', 'ベビーカーグッズ', '可以挂包的挂钩、毯子夹、雨天用的雨罩等', 'バッグをかけられるフック、ブランケットクリップ、雨天用のレインカバーなど。', 'recommended', '按需准备', '必要な分', NULL, NULL, 2);

-- ============================================
-- Items - Car Seat (汽车安全座椅)
-- ============================================
INSERT INTO items (id, subcategory_id, name_zh, name_ja, description_zh, description_ja, priority, quantity_zh, quantity_ja, notes_zh, notes_ja, sort_order)
VALUES
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'car-seat'), '儿童安全座椅', 'チャイルドシート', '有安全带安装和ISOFIX安装等方法，根据车型和使用场景选择', 'シートベルト固定、ISOFIX固定など方法があり、車種や使用シーンに合わせて選択。', 'required', '1台', '1台', NULL, NULL, 1),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'car-seat'), '安全座椅小物件', 'チャイルドシートグッズ', '通知后车有宝宝的警示标志、保护汽车座椅不被划伤弄脏的座椅垫等', '後続車に赤ちゃんがいることを知らせる警告标志、車のシートを傷や汚れから守るシートプロテクターなど。', 'recommended', '按需准备', '必要な分', NULL, NULL, 2);

-- ============================================
-- Items - Baby Carrier (婴儿背带)
-- ============================================
INSERT INTO items (id, subcategory_id, name_zh, name_ja, description_zh, description_ja, priority, quantity_zh, quantity_ja, notes_zh, notes_ja, sort_order)
VALUES
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'baby-carrier'), '婴儿背带', 'ベビーキャリア・スリング', '根据使用月龄，有新生儿型、长期使用型、第二背带等，很多人分开使用2个以上', '使用月齢に合わせて、新生児から使えるタイプ、長く使えるタイプ、2台目としてなど、2つ以上を使い分ける人も多い。', 'required', '1-2个', '1〜2個', NULL, NULL, 1),
  (gen_random_uuid(), (SELECT id FROM subcategories WHERE slug = 'baby-carrier'), '背带小物件', 'キャリアグッズ', '防止口水弄湿背带的带盖、紫外线强的夏天用UV披风、寒冷的冬天用防寒披风等', 'よだれからキャリアを守るカバー、紫外线の強い夏はUVケープ、寒い冬は防寒ケープなど。', 'recommended', '按需准备', '必要な分', NULL, NULL, 2);

-- ============================================
-- End of Data Import
-- ============================================
-- Total Records:
-- - Projects: 1
-- - Categories: 4
-- - Subcategories: 13
-- - Items: 63
-- ============================================
