-- 插入内置 Prompt 模板

INSERT INTO prompt_templates (id, user_id, name, description, content, category) VALUES
-- Code Review 分类
('tmpl_code_review_1', 'system', 'Standard Code Review', 'Review code for quality, security, and best practices', 'Please review this code for:
1. Code quality and readability
2. Security vulnerabilities
3. Performance issues
4. Best practices and design patterns
5. Test coverage

Provide specific recommendations for improvement.', 'code-review'),

('tmpl_code_review_2', 'system', 'Security Code Review', 'Security-focused code review', 'Analyze this code for security issues:
1. Input validation and sanitization
2. SQL injection / XSS vulnerabilities
3. Authentication and authorization
4. Data encryption and protection
5. Third-party dependency risks

Flag all potential vulnerabilities.', 'code-review'),

-- Debug 分类
('tmpl_debug_1', 'system', 'Debug Analysis', 'Systematic debugging approach', 'Help me debug this issue:
1. Reproduce the problem
2. Identify error messages and logs
3. Isolate the root cause
4. Suggest step-by-step fixes
5. Verify the solution

Error: {{ERROR_MESSAGE}}', 'debug'),

('tmpl_debug_2', 'system', 'Performance Debug', 'Identify and fix performance issues', 'Analyze this performance issue:
1. Identify the bottleneck
2. Measure impact
3. Root cause analysis
4. Optimization solutions
5. Implementation priority

Performance metric: {{METRIC}}', 'debug'),

-- Architecture 分类
('tmpl_arch_1', 'system', 'System Design Review', 'Review system architecture', 'Review this system design:
1. Scalability assessment
2. Reliability and fault tolerance
3. Performance characteristics
4. Security architecture
5. Cost efficiency

Provide improvement recommendations.', 'architecture'),

('tmpl_arch_2', 'system', 'Database Schema Design', 'Design or review database schema', 'Help design the database schema for:
{{REQUIREMENTS}}

Consider:
1. Data normalization
2. Indexing strategy
3. Query performance
4. Scalability
5. Data integrity constraints', 'architecture'),

-- Writing 分类
('tmpl_writing_1', 'system', 'Technical Writing', 'Write technical documentation', 'Write documentation for {{TOPIC}}

Include:
1. Overview and purpose
2. Prerequisites
3. Step-by-step guide
4. Examples and use cases
5. Common issues and solutions
6. Best practices', 'writing'),

('tmpl_writing_2', 'system', 'Blog Post', 'Write a blog post', 'Write a blog post about {{TOPIC}}

Structure:
1. Catchy headline
2. Introduction (hook reader)
3. Main points (2-3 sections)
4. Code examples (if relevant)
5. Conclusion and call-to-action

Tone: Friendly and informative', 'writing'),

('tmpl_writing_3', 'system', 'Email Communication', 'Draft professional email', 'Help me draft an email for {{CONTEXT}}

Requirements:
1. Professional tone
2. Clear subject line
3. Concise and to-the-point
4. Call-to-action
5. Appropriate formality level', 'writing'),

-- Brainstorm 分类
('tmpl_brainstorm_1', 'system', 'Ideation Session', 'Generate creative ideas', 'Brainstorm ideas for {{PROJECT_DESCRIPTION}}

Generate:
1. 10+ creative approaches
2. Pros and cons for each
3. Feasibility assessment
4. Resource requirements
5. Recommendation and reasoning', 'brainstorm'),

('tmpl_brainstorm_2', 'system', 'Problem Solving', 'Solve a problem creatively', 'Help me solve this problem: {{PROBLEM}}

Approach:
1. Break down the problem
2. Identify constraints
3. Generate 5+ solutions
4. Evaluate each solution
5. Recommend best approach with implementation steps', 'brainstorm'),

-- Analysis 分类
('tmpl_analysis_1', 'system', 'Data Analysis', 'Analyze data and draw insights', 'Analyze this data: {{DATA}}

Provide:
1. Data summary and statistics
2. Key trends and patterns
3. Anomalies and outliers
4. Correlation analysis
5. Actionable insights and recommendations', 'analysis'),

('tmpl_analysis_2', 'system', 'Competitive Analysis', 'Analyze competitors', 'Compare our product with competitors:
{{COMPETITORS}}

Analyze:
1. Feature comparison
2. Pricing strategy
3. Market positioning
4. Strengths and weaknesses
5. Recommendations for differentiation', 'analysis'),

-- Translation 分类
('tmpl_translation_1', 'system', 'Technical Translation', 'Translate technical content', 'Translate to {{TARGET_LANGUAGE}}:
{{CONTENT}}

Maintain:
1. Technical accuracy
2. Original terminology where appropriate
3. Proper localization
4. Context preservation', 'translation');
