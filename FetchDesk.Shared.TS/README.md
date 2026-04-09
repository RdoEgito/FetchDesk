# FetchDesk.Shared.TS

Pacote TypeScript que replica os DTOs do `FetchDesk.Shared` para uso em `FetchDesk.Client.React` e `FetchDesk.Nest`.

## Build

```bash
cd FetchDesk.Shared.TS
npm install
npm run build
```

## Uso

- `FetchDesk.Client.React` pode consumir o pacote via import local ou symlink.
- `FetchDesk.Nest` pode consumir o pacote como dependência local se configurado como workspace ou importando o caminho.
