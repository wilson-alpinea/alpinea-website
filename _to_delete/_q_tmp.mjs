import { createClient } from "@supabase/supabase-js";
import fs from "fs";
const env = Object.fromEntries(fs.readFileSync(".env.local","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^"|"$/g,"")]}));
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await s.from("candidaturas_vagas").select("id, nome, sobrenome, email, vaga_titulo, created_at, classificacao, ficha_liberada, anulada_em").eq("classificacao","eliminado").or("nome.ilike.%brunna%,nome.ilike.%renan%").order("created_at");
console.log(error ? error.message : JSON.stringify(data, null, 1));
