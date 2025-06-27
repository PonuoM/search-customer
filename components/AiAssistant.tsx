import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CustomerData } from '../types';
import AiIcon from './icons/AiIcon';

interface AiAssistantProps {
  customerData: CustomerData[];
  customerName: string;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ customerData, customerName }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setResponse('');
    setError('');

    // @ts-ignore
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setError('ไม่พบ API Key ของ Gemini กรุณาตั้งค่าใน Environment Variables (API_KEY)');
      setIsLoading(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `คุณคือผู้ช่วยวิเคราะห์ข้อมูลลูกค้าชื่อ 'Prima AI' หน้าที่ของคุณคือตอบคำถามเกี่ยวกับข้อมูลการซื้อของลูกค้าที่กำหนดให้ด้วยภาษาไทยที่สุภาพและเป็นมิตร 
      - ข้อมูลการซื้อทั้งหมดอยู่ในรูปแบบ JSON 
      - ให้อ้างอิงจากข้อมูลที่ให้มาเท่านั้น อย่าสร้างข้อมูลขึ้นมาเอง
      - สกุลเงินคือบาทไทย (THB)
      - วันที่ปัจจุบันคือ ${new Date().toLocaleDateString('th-TH')}`;
      
      const prompt = `
        นี่คือข้อมูลการซื้อทั้งหมดของลูกค้าชื่อ '${customerName}':
        ${JSON.stringify(customerData, null, 2)}

        คำถามจากผู้ใช้: "${query}"

        กรุณาวิเคราะห์และตอบคำถามจากข้อมูลด้านบน
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.2,
        }
      });
      
      setResponse(result.text);

    } catch (err) {
      console.error('Error calling Gemini API:', err);
      setError(err instanceof Error ? `เกิดข้อผิดพลาดในการเรียกใช้ AI: ${err.message}` : 'เกิดข้อผิดพลาดที่ไม่รู้จัก');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-lg p-6 w-full">
      <div className="flex items-center mb-4">
        <AiIcon className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-[var(--text-strong)] ml-3">AI Assistant</h3>
      </div>

      <form onSubmit={handleAskAi}>
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            className="block w-full h-24 p-4 text-md text-[var(--text-strong)] rounded-lg bg-transparent border border-[var(--glass-border)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 placeholder:text-[var(--text-subtle)] disabled:opacity-50"
            placeholder={`ถาม AI เกี่ยวกับคุณ ${customerName}... \nเช่น "สินค้าที่ซื้อบ่อยที่สุดคืออะไร?"`}
            aria-label="Ask AI about this customer"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute bottom-3 right-3 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400/50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'กำลังคิด...' : 'ส่งคำถาม'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">
            <p className="font-bold">เกิดข้อผิดพลาด:</p>
            <p>{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-4 text-[var(--text-strong)] bg-[var(--hover-bg)] p-4 rounded-lg prose prose-invert prose-p:my-2 whitespace-pre-wrap">
            {response}
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
