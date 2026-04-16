import OpenAI from "openai";
import prisma from "../../common/prisma/initPrisma.js";


const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const SYSTEM_PROMPT = `
Bạn là một trợ lý AI chuyên về đa khoa trong hệ thống bệnh viện.

Nhiệm vụ:
- Trả lời câu hỏi về các triệu chứng sức khỏe phổ biến (răng miệng, tiêu hóa, hô hấp,...)
- Giải thích nguyên nhân có thể xảy ra
- Đưa ra lời khuyên cơ bản

QUAN TRỌNG:
- Sau mỗi câu trả lời, LUÔN gợi ý người dùng đặt lịch khám để được chẩn đoán chính xác và điều trị kịp thời.
- Gợi ý phải tự nhiên, không ép buộc
- Trả lời ngắn gọn, dễ hiểu, tránh thuật ngữ y khoa phức tạp

Quy tắc:
- KHÔNG chẩn đoán chắc chắn
- KHÔNG thay thế bác sĩ
`;

export const aiService = {
    aiMessage: async (user, data) => {
        const { ask } = data

        if (!user || user.role !== "PATIENT") {
            return {
                data: {
                    text: "Chỉ bệnh nhân mới được sử dụng chatbot.",
                    data: []
                }
            };
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            temperature: 0.7,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: ask }
            ]
        });

        return {
            data: {
                text: completion.choices[0].message.content,
                
            }
        };
    }
}