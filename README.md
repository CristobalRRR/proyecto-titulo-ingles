# proyecto-titulo-ingles

<h1>Entorno Virtual</h1>

<p>Crear un entorno virtual:</p>
<pre><code>python -m venv nombre</code></pre>

<p>Activar el entorno (Windows):</p>
<pre><code>nombre\Scripts\activate</code></pre>

<p><strong>Nota:</strong> Activar el entorno tanto para el <em>front</em> como para el <em>back</em>.</p>

<hr>

<h1>Frontend</h1>

<p>Instalar dependencias:</p>
<pre><code>npm install
npm install axios</code></pre>

<p>Correr el servidor de desarrollo:</p>
<pre><code>npm run dev</code></pre>

<hr>

<h1>Backend</h1>

<p>Instalar dependencias:</p>
<pre><code>pip install djangorestframework
pip install django-cors-headers
pip install openai
pip install python-dotenv
pip install google-genai</code></pre>

<p>Aplicar migraciones:</p>
<pre><code>python manage.py makemigrations
python manage.py migrate</code></pre>

<p>Correr el servidor:</p>
<pre><code>python manage.py runserver</code></pre>
