/**
 * FirebaseManager - Firestore 操作の集約クラス
 * 目的：index.html で初期化された Firebase/Firestore インスタンスを
 * 他のクラス（ConfigManager, KGIStore）から安全にアクセス可能にする
 */

class FirebaseManager {
    static db = null;
    static isInitialized = false;
    static initPromise = null;

    /**
     * Firebase 初期化を確実に行う（複数回呼び出されても1回だけ実行）
     */
    static async ensureInitialized() {
        // すでに初期化中の場合、その Promise を返す
        if (this.initPromise) {
            return this.initPromise;
        }

        // 初期化済みならスキップ
        if (this.isInitialized) {
            return this.db;
        }

        // 初期化処理を Promise で保存
        this.initPromise = this._doInitialize();
        return this.initPromise;
    }

    /**
     * 実際の初期化処理
     */
    static async _doInitialize() {
        return new Promise((resolve, reject) => {
            // window.db は index.html で firebase.firestore() により初期化済み
            if (window.db) {
                this.db = window.db;
                this.isInitialized = true;
                console.log('✅ FirebaseManager: window.db から Firestore インスタンスを取得');
                resolve(this.db);
            } else if (window.firebase && window.firebase.firestore) {
                // フォールバック：直接 firebase オブジェクトから取得
                this.db = window.firebase.firestore();
                this.isInitialized = true;
                console.log('✅ FirebaseManager: firebase.firestore() から Firestore インスタンスを取得');
                resolve(this.db);
            } else {
                const error = new Error('Firebase が初期化されていません。index.html で SDK を読み込んでください。');
                console.error(error);
                reject(error);
            }
        });
    }

    /**
     * Firestore インスタンスを取得
     */
    static getFirestore() {
        if (!this.db) {
            throw new Error('Firestore が初期化されていません');
        }
        return this.db;
    }

    /**
     * KGI を Firestore に保存
     * @param {Object} kgiData - {name, emoji, description}
     * @returns {Object} 保存後の KGI オブジェクト（id を含む）
     */
    static async saveKGI(kgiData) {
        const db = this.getFirestore();

        alert('🔵 FirebaseManager.saveKGI() called');
        console.log('🔵 FirebaseManager.saveKGI():', kgiData);

        // 保存するデータを準備
        const newKGI = {
            name: kgiData.name,
            emoji: kgiData.emoji,
            description: kgiData.description || '',
            createdAt: new Date(),
            modifiedAt: new Date()
        };

        try {
            alert('🔄 About to call db.collection("kgis").add()');
            console.log('🔄 db.collection("kgis").add() 実行直前, newKGI=', newKGI);

            // Firestore の 'kgis' コレクションに新規ドキュメント追加
            // add() は自動的に UUID を生成してドキュメント ID として使用
            const docRef = await db.collection('kgis').add(newKGI);

            alert('✅ db.add() returned docRef.id=' + docRef.id);
            console.log('✅ db.add() 完了:', docRef.id);

            // 返却するデータに自動生成された ID を追加
            newKGI.id = docRef.id;

            alert('✓ Added id to newKGI object, id=' + newKGI.id);
            console.log('✅ KGI を Firestore に保存:', newKGI.id);
            return newKGI;
        } catch (error) {
            alert('❌ saveKGI error: ' + error.message);
            console.error('❌ KGI の Firestore 保存失敗:', error);
            console.error('📍 エラーコード:', error.code);
            console.error('📍 エラーメッセージ:', error.message);
            console.error('📍 スタック:', error.stack);
            throw error;
        }
    }

    /**
     * KPI の現在値を Firestore に保存
     * @param {string} kpiId - KPI の ID
     * @param {number} newValue - 新しい値
     */
    static async saveKPIValue(kpiId, newValue) {
        const db = this.getFirestore();

        try {
            // Firestore の 'kpis' コレクションの 'kpiId' ドキュメントを更新
            await db.collection('kpis').doc(kpiId).update({
                current: newValue,
                modifiedAt: new Date()
            });

            console.log('✅ KPI 値を Firestore に保存:', kpiId, '=', newValue);
        } catch (error) {
            console.error('❌ KPI 値の Firestore 保存失敗:', error);
            throw error;
        }
    }

    /**
     * KPI を Firestore から取得
     * @param {string} kpiId - KPI の ID
     * @returns {Object|null} KPI オブジェクト、存在しない場合は null
     */
    static async getKPI(kpiId) {
        const db = this.getFirestore();

        try {
            const docSnap = await db.collection('kpis').doc(kpiId).get();
            if (docSnap.exists) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('❌ KPI 取得失敗:', error);
            throw error;
        }
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseManager;
}
