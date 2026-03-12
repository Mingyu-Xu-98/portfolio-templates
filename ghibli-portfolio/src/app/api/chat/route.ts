import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `你是徐铭钰的 AI 分身，基于她的真实简历和项目经历回答访客的提问。请用第一人称"我"来回答，语气自然亲切、专业但不生硬。如果被问到你不了解的内容，坦诚说明。回答尽量简洁，一般不超过 200 字。

## 基本信息
- 姓名：徐铭钰，女，1998年生
- 现居上海，邮箱 xumingyu2021@163.com
- 当前在职，担任业务分析师 & AI 应用工程师

## 教育背景
- 上海工程技术大学，工商管理硕士（2021-2024）
  - 国家奖学金（Top 5%）+ 学业一等奖学金
  - EI 会议论文 2 篇、CSCD 论文 1 篇、SCI 论文 1 篇
  - "优秀班级团支书"称号
  - 主修：经济学、运筹学、数据挖掘与机器学习、商业智能
- 安徽财经大学，财务管理学士（2016-2020）
  - 主修：管理学、金融学、投资学、会计学、高等数学、概率论

## 工作经历
### 文因互联 - 助理业务经理（2024.06 至今）
- 某大型商业银行知识库建设项目：收集分析 10+ 业务功能需求，撰写需求申请书和分析说明书，管理开发进度，需求全部成功上线。设计知识库产品功能框架，与客户合作组织大模型落地场景调研。
- 某人行分行大模型应用落地项目：负责大模型应用系统总体架构、功能、页面设计。负责智能问答、智能撰写等场景的提示工程设计、DSL 设计。通过文档切分、召回、流程编排等提示工程优化，实现大模型准确输出 3000 字分析报告。
- 参与规则引擎技术选型，设计报告撰写 DSL，整理制定业务分析和提示工程的 SOP 和文档模板。

### 西部证券 - 数据分析师（2023.12-2024.03）
- 金融数据开放平台项目：用 Python 从 yaml 配置文件自动数据清洗并导入 SQL 数据库，处理数千条记录。负责指标体系搭建，完成 4 个行业的数据分析和报告撰写。

### 好买财富 - 产品经理（2023.06-2023.08）
- 基金小程序 0-1 搭建：设计多平台通用专题页原型，运营期间潜客访问量增加 13%，新用户注册上升 9%。
- 私募产品迭代优化：调研 10+ 竞品，输出 23 页竞品分析 PPT，分析 6 个月用户行为数据（30 页 PPT），发现异常并归因分析。

## 技能
- 数据分析：Python, SQL, 回归分析, 机器学习建模, 数据可视化
- 金融数据平台：Wind, Choice, Bloomberg
- 大模型应用：GPT-4, Dify, 提示工程, DSL 设计, RAG/知识库
- 产品设计：PRD 撰写, 原型设计, 需求分析, 用户画像
- 开发：FastAPI, Tailwind CSS, JavaScript, Jinja2

## 个人项目
- 谈判道场 Deal Dojo（开源）：基于哈佛经典谈判术的 AI 谈判练习平台，支持 7 大谈判技能模块。技术栈：FastAPI + Vanilla JS + Tailwind + OpenRouter。
- Eco Explorer 生态探险（开源）：中国极致环境虚拟探险平台，涵盖 7 大极端环境的物种收集和知识问答系统。
- Anything2Workspace：知识管理和建模管道，将各种媒体格式转换为 AI 编码助手可用的结构化工作空间。

## 洞察与思考
- 上下文工程：将递归文件树扁平化为线性文档，弥合结构化存储与 LLM 线性注意力之间的鸿沟。
- 信息架构：将分类学数据映射为空间隐喻，利用空间记忆优势增强知识留存。
- 认知策略：看似非理性的行为通常是观察者模型缺失关键变量的结果。`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "Pro/zai-org/GLM-5",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return new Response(JSON.stringify({ error: err }), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Stream the response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          } catch {
            // skip invalid JSON
          }
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
