// src/api/microcms.js
import { createClient } from 'microcms-js-sdk';

export const client = createClient({
  serviceDomain: import.meta.env.VITE_MICROCMS_SERVICE_ID, // サービスID
  apiKey: import.meta.env.VITE_MICROCMS_API_KEY,         // APIキー
});

// 例: プラグイン情報を取得する関数
export const getPlugins = async (queries = {}) => {
  try {
    const data = await client.get({
      endpoint: 'plugins', // API名
      queries: queries,
    });
    // createdAtはMicroCMSのAPIから返されないので、変換処理は不要だよ
    return {
      ...data,
      contents: data.contents.map(item => ({
        ...item,
        // tagsがカンマ区切りの文字列の場合を想定して配列に変換し、余分な空白も削除するんだ
        tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : []
      }))
    };
  } catch (error) {
    console.error('Error fetching plugins:', error);
    return { contents: [], totalCount: 0 };
  }
};

// 例: スクリプト情報を取得する関数 (必要に応じて)
export const getScripts = async (queries = {}) => {
  try {
    const data = await client.get({
      endpoint: 'scripts', // API名
      queries: queries,
    });
    return {
      ...data,
      contents: data.contents.map(item => ({
        ...item,
        tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : []
      }))
    };
  } catch (error) {
    console.error('Error fetching scripts:', error);
    return { contents: [], totalCount: 0 };
  }
};