class OptisparDB {
    constructor() {
        this.dirHandle = null;
        this.fileHandles = {};
        this.stores = ['konten','buchungen','waren','lagerbewegungen','bestellungen','users'];
        this.data = {};
    }

    async init() {
        this.dirHandle = await window.showDirectoryPicker();
        for (const store of this.stores) {
            try {
                const fileHandle = await this.dirHandle.getFileHandle(`${store}.json`, { create: true });
                this.fileHandles[store] = fileHandle;
                const file = await fileHandle.getFile();
                const text = await file.text();
                this.data[store] = text ? JSON.parse(text) : [];
            } catch (e) {
                console.error(`Fehler beim Laden von ${store}.json`, e);
                this.data[store] = [];
            }
        }
    }

    async persist(store) {
        const handle = this.fileHandles[store];
        if (!handle) return;
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(this.data[store], null, 2));
        await writable.close();
    }

    async add(store, record) {
        if (record.id === undefined && store !== 'konten') {
            record.id = this.generateUUID();
        }
        record.created_at = new Date().toISOString();
        record.updated_at = record.created_at;
        this.data[store].push(record);
        await this.persist(store);
        return record.id || record.nummer;
    }

    async put(store, record) {
        record.updated_at = new Date().toISOString();
        const key = record.id || record.nummer;
        const items = this.data[store];
        const idx = items.findIndex(i => (i.id || i.nummer) === key);
        if (idx !== -1) items[idx] = record;
        await this.persist(store);
        return key;
    }

    async get(store, key) {
        return this.data[store].find(i => (i.id || i.nummer) === key);
    }

    async getAll(store) {
        return [...this.data[store]];
    }

    async delete(store, key) {
        const items = this.data[store];
        const idx = items.findIndex(i => (i.id || i.nummer) === key);
        if (idx !== -1) {
            items.splice(idx, 1);
            await this.persist(store);
        }
    }

    async count(store) {
        return this.data[store].length;
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
