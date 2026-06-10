INSERT OR REPLACE INTO models (id, name, description, enabled, sort_order, is_default) VALUES
('gemini-3.5-flash', 'gemini-3.5-flash', '快速通用', 1, 10, 1),
('gemini-3.5-flash-thinking', 'gemini-3.5-flash-thinking', '深度思考，输出最长（约2万字）', 1, 20, 0),
('gemini-3.5-flash-thinking-lite', 'gemini-3.5-flash-thinking-lite', '自适应思考深度', 1, 30, 0),
('gemini-auto', 'gemini-auto', '自动选模型', 1, 40, 0),
('gemini-flash-lite', 'gemini-flash-lite', '轻量快速', 1, 50, 0);

INSERT OR REPLACE INTO system_settings (key, value) VALUES
('site_name', 'Kaixin Gemini'),
('logo_url', ''),
('announcement', '欢迎使用 Kaixin Gemini。'),
('seo_title', 'Kaixin Gemini AI Chat'),
('seo_description', '一个运行在 Cloudflare 上的极简 AI 模型对话平台。'),
('seo_keywords', 'AI Chat,Gemini,Cloudflare,Workers,D1'),
('allow_registration', 'true');
