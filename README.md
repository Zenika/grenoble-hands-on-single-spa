# Micro-frontends avec single SPA

Nous allons essayer de découper notre application de météo en plusieurs applications et de les combiner avec single-spa.
Le but de ce découpage/ré-assemblage est uniquement à but éducatif avec de jouer avec single-spa et comprendre les mécanismes mis en jeu par un architecture micro-frontend.

Pour simuler la construction d'une application de météo à partir de plusieurs micro-frontend potentiellement hétérogènes d'un point de vue technique, nous allons utiliser un morceau de l'application de météo écrite en [Angular](https://github.com/Zenika/grenoble-hands-on-angular/tree/ssr) et un autre morceau de cette même application écrite en [Vuejs](https://github.com/Zenika/grenoble-hands-on-vuejs)

## Découpage

Nous allons simuler deux micro-frontend :
- une application Angular
- une application Vuejs

Dans un premier temps, il nous faudra une application pour gérer la liste des villes et la capacité d'ajouter une ville à la liste. Nous utiliserons notre application Angular pour cela.

Ensuite il faudra être en mesure d'afficher les prévisions météo pour une ville. L'application Vuejs sera responsable de cette portion.

Enfin, il nous faudra mettre en place une application hôte pour gérer l'orchestration de nos deux applications, leur positionnement, leur cycle de vie.

## Initialiser un repos git par application

Idéalement, il faudrait que les différentes applications soient le plus indépendantes possibles (code, dépot, pipeline, déploiement, ...).
Vous pouvez donc préparer trois répertoires, une pour l'application hôte, une pour chaque micro-frontend.

```sh
git clone -b ssr https://github.com/Zenika/grenoble-hands-on-angular
git clone -b corrections https://github.com/Zenika/grenoble-hands-on-vuejs
mkdir root-config-single-spa
```

> Pour des raisons de praticité, les exemples de ce dépot seront sous la forme d'un monorepos géré avec [Lerna](https://lerna.js.org/) plutôt que dans 3 dépots distincts.
>
> Le dossier `apps` contiendra les trois applications et chaque commit s'efforcera de représenter au mieux les étapes décrites ci-dessous.

## Créer une application hôte

Nous allons utiliser directement le générateur fourni par single-spa pour générer l'application hôte.
Laissez toutes les options par défaut.

```sh
cd root-config-single-spa
npx create-single-spa --moduleType root-config
npm run start
```

## Sélection des portions de chaque micro-frontend

Les deux applications (Angular/Vuejs) doivent être "nettoyées" du contenu qui ne sera pas utilisé.

Vous pouvez essayer de retirer par vous-même tout ce qui ne sera pas utilisé dans chacune en guise d'exercice.
Si vous voulez allez au plus vite, vous pouvez désactiver les sections que vous souhaitez directement dans le fichier de routing de chaque application et désactiver les composants du header et du footer.

Pour Angular, on conservera les routes `/` et `/create`, pour Vuejs, on ne conservera que la route des prévisions `:cityName` qu'on préfixra pour obtenir `/city/:cityName`.

<details>
<summary>
Le code de chaque application peut être récupérée dans les répertoires de ce dépôt.
</summary>
<pre>
  - packages/city-angular
  - packages/weather-vue
</pre>
</details>

## Migrations des micro-frontend

### Migrations Angular

Si vous utiliser la CLI angular, un `schematics` de migration est disponible pour transformer directement une application Angular en application compatible avec single-spa.

À la racine du projet Angular, lancer directement la commande suivante pour l'utiliser :
```sh
ng add single-spa-angular
// ou
npx @angular/cli add single-spa-angular
```

Ensuite direction ce [guide](https://single-spa.js.org/docs/ecosystem-angular/#configure-routes) pour finaliser la migration du rounting de votre application.

> Si vous n'utiliser pas la CLI, ou que l'architecture actuelle de votre projet ne permet pas cette migration, vous pouvez réaliser la migration manuellement grâce à ce [guide](https://single-spa.js.org/docs/ecosystem-angular/#manual-installation)


Vérifier que l'application démarre `npm run serve:single-spa:grenoble-hands-on` : [http://localhost:4200](http://localhost:4200)

### Migration Vue

Si vous utiliser la CLI vue, un `plugin` de migration est disponible pour transformer directement une application Vuejs en application compatible avec single-spa.


À la racine du projet Vuejs, lancer directement la commande suivante pour utiliser le plugin :

```sh
vue add single-spa
// ou
npx @vue/cli add single-spa
```

Des infos sont disponibles [ici](https://single-spa.js.org/docs/ecosystem-vue#without-vue-cli) pour ceux qui n'utilisent pas la CLI.

On changera au passage la route pour accéder à la météo d'une ville en la préfixant par `/city`

> Il sera probablement nécessaire de changer le nom (champ `name`) du package dans le `package.json` pour qu'il corresponde au nom par lequel vous souhaitez importer cette application

Vérifier que l'application démarre `npm run serve` : [http://localhost:8080](http://localhost:8080)

## Import des applications dans single spa

### Header et Footer
Pour commencer, direction le fichier `microfrontend-layout.html` pour définir le layout de notre application.

Dans une premier temps, ajouter un header et un footer. Ceux issus de notre application météo de base ([Angular](https://github.com/Zenika/grenoble-hands-on-angular/tree/ssr/src/app/shared/components) ou [Vuejs](https://github.com/Zenika/grenoble-hands-on-vuejs/tree/master/src/components)) seront parfait, il faudra simplement adapter la syntaxe pour retirer les directives issues d'un framework et convertir le tout en HTML natif

> Single-spa recommande d'extraire les composants de navigation dans leur propre "application" afin de pouvoir gérer plus finement ceux-ci. Dans le cadre de cet exemple, nous passerons cette étape pour des raisons de simplicité.

Vérifier que le header et le footer s'affichent en consultant [http://localhost:9000](http://localhost:9000)

### Micro-frontend Angular et Vuejs

Ensuite, éditer le ficher `index.ejs` (le template de notre `index.html` final) pour ajouter dans la balise `<script type="systemjs-importmap">` les liens vers nos deux applications.

Le résultat final devrait ressembler à ce qui suit :

```html
  <% if (isLocal) { %>
  <script type="systemjs-importmap">
    {
      "imports": {
       "@zenika/city-angular": "//localhost:4200/main.js",
       "@zenika/weather-vue": "//localhost:8080/js/app.js",
        "@zenika/root-config": "//localhost:9000/zenika-root-config.js"
      }
    }
  </script>
  <% } %>
```

Retirer les balises bloquants les CSP, décommenter l'import de zone.js (nécessaire pour Angular) et ajouter les imports pour [Leaflet](https://leafletjs.com/) et [Bulma](https://bulma.io/)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==" crossorigin=""/>
```

Retour dans le fichier `microfrontend-layout.html`, où l'on va pouvoir désormais ajouter la déclaration de nos routes et remplacer toute la balise `<main>` par :
```html
<main style="min-height: calc(100% - 64px - 168px);">
    <route default>
        <application name="@zenika/city-angular"></application>
    </route>
    <route path="city">
        <application name="@zenika/weather-vue"></application>
    </route>
</main>
```

> Vérifier que l'ensemble des routes sont consultables
> - `/`
> - `/city/GRENOBLE`
> - `/create`

# Bonus : LocalStorage

Actuellement notre application n'est pas fonctionnelle à 100%. En effet, que ce soit coté Angular ou Vuejs, les services accédant à la liste des villes ont chacun leur état (state) et ne sont pas reliés. L'ajout d'une ville dans le micro-frontend Angular n'est pas réflété dans le micro-front Vuejs.

Pour communiquer, vous pouvez consulter les solution préconisées par single-spa pour partager du code/de la logique : [ici](https://single-spa.js.org/docs/module-types).
Vous pouvez également choisir d'implémenter vous même un certains contrat entre deux de vos modules pour vous partager les données (par ex. via l'API `localStorage`).

Exercice : essayer de faire en sorte que l'ajout d'une ville se permette de naviguer vers la page des prévisions de celle-ci.
