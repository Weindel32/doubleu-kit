# Backup catalogo

`catalog-2026-08-25.json` è il contenuto del campo `data` della riga
`__catalog__` (tabella `projects`, progetto Supabase `bliljqmgzzxshvhyzzos`)
com'era **prima** dell'import del listino DOUBLEU del 25/08/2026: 45 articoli.

Fedeltà verificata confrontando l'md5 di ogni voce con quello calcolato dal
database: rolling hash `cfea614588df82579d2400f1f8f67621`.

## Ripristino

```sql
update projects
set data = '<contenuto di catalog-2026-08-25.json>'::jsonb
where name = '__catalog__';
```

Dopo il ripristino, sui dispositivi già sincronizzati va svuotata la chiave
`doubleu_catalog_v1` in localStorage: il merge cloud/locale (`mergeCatalogFromCloud`)
dà precedenza al locale, quindi senza quel passaggio il catalogo vecchio non
ricompare.
