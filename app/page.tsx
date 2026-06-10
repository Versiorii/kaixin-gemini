import { ChatApp } from "@/components/chat/chat-app";
import { DEFAULT_MODELS, listModels } from "@/lib/models";


export const dynamic = "force-dynamic";

export default async function HomePage() {
  const models = await listModels(false).catch(() => DEFAULT_MODELS.map((model, index) => ({ ...model, enabled: 1, sort_order: index * 10, is_default: index === 0 ? 1 : 0 })));
  return <ChatApp initialModels={models} />;
}
