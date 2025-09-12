// 数据迁移工具 - 将本地数据上传到Firestore
import { collection, addDoc, doc, setDoc, getDocs } from 'firebase/firestore'
import { firestore } from '../firebase.js'
import { vitaminArticles } from '../data/vitaminArticles.js'

// 迁移宏量营养素文章到Firestore
export const migrateMacroArticles = async () => {
    try {
        console.log('开始迁移宏量营养素文章数据...')

        // 迁移每篇文章
        for (const article of vitaminArticles) {
            try {
                // 使用文章ID作为文档ID
                const articleRef = doc(firestore, 'recipe', `recipe_${article.id}`)

                // 添加分类字段，标识这是宏量营养素文章
                const articleData = {
                    ...article,
                }

                await setDoc(articleRef, articleData)
                console.log(`✅ 已迁移文章: ${article.title}`)

            } catch (error) {
                console.error(`❌ 迁移文章失败 ${article.title}:`, error)
            }
        }

        console.log('🎉 迁移完成!')
        return { success: true, message: '数据迁移成功' }

    } catch (error) {
        console.error('❌ 数据迁移失败:', error)
        return { success: false, message: '数据迁移失败', error }
    }
}


// 手动触发迁移的函数（仅在开发环境使用）
export const triggerMigration = async () => {
    if (process.env.NODE_ENV !== 'development') {
        console.warn('迁移脚本仅在开发环境中运行')
        return
    }

    return await migrateMacroArticles()
}
