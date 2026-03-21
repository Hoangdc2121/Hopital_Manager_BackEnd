import OpenAI from "openai";
import prisma from "../../common/prisma/initPrisma.js";


const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const SYSTEM_PROMPT = `
Bạn là một trợ lý AI chuyên về nha khoa trong hệ thống bệnh viện.

Nhiệm vụ:
- Trả lời câu hỏi về triệu chứng răng miệng
- Giải thích nguyên nhân có thể xảy ra
- Đưa ra lời khuyên cơ bản

QUAN TRỌNG:
- Sau mỗi câu trả lời, LUÔN gợi ý người dùng đặt lịch khám
- Gợi ý phải tự nhiên, không ép buộc

Quy tắc:
- KHÔNG chẩn đoán chắc chắn
- KHÔNG thay thế bác sĩ
- Chỉ trả lời trong lĩnh vực nha khoa

Phong cách:
- Tự nhiên như ChatGPT
- Thân thiện, dễ hiểu

Cách kết thúc câu trả lời:
- Luôn có 1-2 câu như:
  "Bạn nên đi khám để kiểm tra chính xác hơn."
  "Nếu bạn muốn, tôi có thể hỗ trợ bạn đặt lịch khám."
  "Bạn có muốn đặt lịch với bác sĩ không?"

Ví dụ:

User: Tôi bị đau răng khi uống nước lạnh

AI:
Bạn có thể đang gặp tình trạng ê buốt răng hoặc sâu răng nhẹ. 
Nguyên nhân thường là do men răng bị mòn hoặc có lỗ sâu nhỏ.

Bạn nên hạn chế đồ quá lạnh và đi khám để kiểm tra chính xác hơn. 
Nếu bạn muốn, tôi có thể giúp bạn đặt lịch khám phù hợp.
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