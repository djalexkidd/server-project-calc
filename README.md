# server-project-calc

Un utilitaire web pour calculer la répartition d’un montant global entre différents serveurs à partir d’un fichier Excel. Chaque serveur est évalué en fonction de sa puissance (disque, RAM, CPU), et le montant qui lui est attribué est proportionnel à ses ressources.

[Lien de l'application](https://djalexkidd.github.io/server-project-calc)

## Installation

### Docker Compose

Voici un exemple de fichier Compose pour déployer l'application :

```yaml
services:
  server-project-calc:
    image: ghcr.io/djalexkidd/server-project-calc:latest
    container_name: server-project-calc
    restart: always
    ports:
      - "80:8080"
```

Pour avoir un exemple avec Traefik : [docker-compose.yaml avec Traefik](https://github.com/djalexkidd/server-project-calc/blob/master/docker-compose.yaml)