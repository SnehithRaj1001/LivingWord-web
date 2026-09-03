import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("ref");
  const translationParam = (searchParams.get("translation") || "78a9f6124f344018-01").toLowerCase();

  if (!reference) {
    return NextResponse.json({ error: "Missing ref parameter" }, { status: 400 });
  }

  const supabase = await createClient();

  // 1. Check local Supabase cache first for exact reference + translation match
  const { data: cached } = await supabase
    .from("bible_references")
    .select("text, translation")
    .eq("reference", reference)
    .eq("translation", translationParam)
    .single();

  if (cached) {
    return NextResponse.json({
      reference,
      text: cached.text,
      translation: cached.translation.toUpperCase(),
      cached: true,
    });
  }

  // 2. Fetch passage
  try {
    const apiKey = process.env.BIBLE_API_KEY || process.env.API_BIBLE_KEY;

    if (apiKey && translationParam.includes("-")) {
      // Map standard reference (e.g. "John 3:16") to API.Bible passage search
      const res = await fetch(`https://api.scripture.api.bible/v1/bibles/${translationParam}/search?query=${encodeURIComponent(reference)}`, {
        headers: { "api-key": apiKey }
      });
      if (res.ok) {
        const data = await res.json();
        const passage = data.data?.passages?.[0];
        if (passage?.content) {
          // Clean HTML tags from API.Bible content
          const text = passage.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          
          // Cache in Supabase safely (non-blocking)
          try {
            await supabase.from("bible_references").upsert({
              reference,
              book: reference.split(" ")[0],
              chapter: 1,
              verse_start: 1,
              text,
              translation: translationParam,
            }, { onConflict: "reference,translation" });
          } catch (err) {
            console.warn("Supabase cache write failed:", err);
          }

          const displayNames: Record<string, string> = {
            "de4e12af7f28f599-02": "KJV",
            "06125adad2d5898a-01": "ASV",
            "a81b73293d3080c9-01": "AMP",
            "78a9f6124f344018-01": "NASB",
          };
          const translationName = displayNames[translationParam] || translationParam.toUpperCase();

          return NextResponse.json({ reference, text, translation: translationName, cached: false });
        }
      }
    }

    // Map API.Bible IDs to public API translations if API_BIBLE_KEY is not set or failed
    const translationMap: Record<string, string> = {
      "de4e12af7f28f599-02": "kjv",     // KJV fallback
      "06125adad2d5898a-01": "asv",     // ASV fallback
      "a81b73293d3080c9-01": "almeida", // AMP fallback
      "78a9f6124f344018-01": "web",     // NASB fallback
    };

    const targetTranslation = translationMap[translationParam] || (translationParam.includes("-") ? "web" : translationParam);
    const res = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}?translation=${targetTranslation}`);
    if (!res.ok) {
      return NextResponse.json({
        reference,
        text: `Passage ${reference} not available in this translation format.`,
        translation: translationParam.toUpperCase(),
        cached: false,
      });
    }
    const data = await res.json();
    const text = data.text?.trim() || "Passage text unavailable.";
    const translationName = data.translation_name || targetTranslation.toUpperCase();

    // Cache in Supabase under requested translation parameter ID safely
    try {
      await supabase.from("bible_references").upsert({
        reference,
        book: data.verses?.[0]?.book_name || reference.split(" ")[0],
        chapter: data.verses?.[0]?.chapter || 1,
        verse_start: data.verses?.[0]?.verse || 1,
        text,
        translation: translationParam,
      }, { onConflict: "reference,translation" });
    } catch (err) {
      console.warn("Supabase cache write failed:", err);
    }

    return NextResponse.json({
      reference,
      text,
      translation: translationName,
      cached: false,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch verse text" },
      { status: 500 }
    );
  }
}
