const form = document.querySelector('#form-pokemon');
const inputNome = document.querySelector('#nome');
const inputTreinador = document.querySelector('#treinador');
const inputTipo = document.querySelector('#tipo');
const inputCp = document.querySelector('#cp');
const feedback = document.querySelector('#feedback');
const dadomokado = {
    name: 'Pikachu',
    base_experience: 112,
    types: [
        { slot: 1, type: { name: 'eletric'} }
    ],
    sprites: {
        front_default: './pikachu.png',
        other: {
            'official-artwork': {
                front_default: './pikachu.png'
            }
        }
    }
}

// exercicio 0
const listaCards = document.querySelector('#lista-cards'); 


let pokemonsNaArena = [];

async function buscarDadosPokemon(nome) {
    try {
        const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome.toLowerCase()}`);
        
        // o fetch não cai no 'catch' precisamos validar o response.ok
        if (!resposta.ok) {
            return null;
        }
        
        return await resposta.json();
    } catch (erro) {
        return null;
    }
}

function extrairImagemPokemon(dados) {
    return dados.sprites.other['official-artwork'].front_default || dados.sprites.front_default;
}

function extrairTipoPokemon(dados) {
    return dados.types.map(item => item.type.name);
}

function extrairCombatPower(dados) {
    return dados.base_experience || 0;
}

//  alterar a borda e a cor de fundo do card dependendo do Pokémon
function aplicarEstiloPorTipo(card, tipos) {
    const paletaDeTipos = {
        fire: { borda: '#e25822', fundo: '#ffe3d6' },
        water: { borda: '#2980d9', fundo: '#dcecff' },
        grass: { borda: '#3a9d3a', fundo: '#e0f6dc' },
        electric: { borda: '#d4a800', fundo: '#fff7c2' },
        poison: { borda: '#8e44ad', fundo: '#eddcf5' },
        normal: { borda: '#7f8c8d', fundo: '#ececec' },
        psychic: { borda: '#ff69b4', fundo: '#ffdaeb' },
        ghost: { borda: '#705898', fundo: '#dcd3eb' } // Para o Gastly
    };

    //  usa o primeiro tipo do array
    const tipoPrincipal = (tipos && tipos.length > 0) ? tipos[0].toLowerCase() : '';

    //  se não encontrar no objeto, usa estilo cinza padrão
    const estilo = paletaDeTipos[tipoPrincipal] || { borda: '#555', fundo: '#ccc' };

    // aplica a borda de 3px solid e a cor de fundo
    card.style.border = `3px solid ${estilo.borda}`;
    card.style.backgroundColor = estilo.fundo;
}

//  a função recebe o parametro treinador (com valor padrão) ja definido.
function criarCardPokemon(pokemon, ehCampeao) {
    const card = document.createElement('div');
    card.classList.add('card');
    
    //  adiciona a classe visual ao campeão
    if (ehCampeao) {
        card.classList.add('campeao');
    }

    // tipos separados por vírgula e espaço usando join
    const tiposFormatados = pokemon.tipos.join(', ');

    card.innerHTML = `
        <h3>${ehCampeao ? '👑 ' : ''}${pokemon.nome}</h3>
        <img src="${pokemon.imagem}" alt="${pokemon.nome}" width="100">
        <p><strong>Tipo:</strong> ${tiposFormatados}</p>
        <p><strong>CP:</strong> ${pokemon.cp}</p>
        <p><strong>Treinador:</strong> ${pokemon.treinador}</p>
        <button class="btn-remover" data-nome="${pokemon.nome}">🗑️ Remover</button>
    `;

    //  chamando a função de aplicar estilos
    aplicarEstiloPorTipo(card, pokemon.tipos);

    return card;
}

// função para desenhar a lista baseada no array e destacar o mais forte
function renderizarArena() {
    listaCards.innerHTML = ''; //limpa a tela antes de desenhar
    
    // ordena do maior para o menor CP
    pokemonsNaArena.sort((a, b) => b.cp - a.cp);

    pokemonsNaArena.forEach((pokemon, index) => {
        // o índice 0 após a ordenação é o campeão
        const ehCampeao = (index === 0 && pokemonsNaArena.length > 0);
        const cardCriado = criarCardPokemon(pokemon, ehCampeao);
        listaCards.appendChild(cardCriado);
    });
}


listaCards.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-remover')) {
        const nomeRemover = event.target.getAttribute('data-nome');
        
        // remove do array base e recarrega
        pokemonsNaArena = pokemonsNaArena.filter(p => p.nome.toLowerCase() !== nomeRemover.toLowerCase());
        renderizarArena();
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nomeOriginal = inputNome.value.trim();
     // 1 ;
    const treinadorInput = inputTreinador.value.trim() || "Sem treinador"; 

    if (!nomeOriginal) return;

    
    const jaExiste = pokemonsNaArena.some(p => p.nome.toLowerCase() === nomeOriginal.toLowerCase());
    if (jaExiste) {
        feedback.textContent = '❌ Esse pokemon já está na arena.';
        feedback.style.color = 'red';
        return;
    }

    feedback.textContent = 'Buscando na Pokedex...';
    feedback.style.color = 'black';

    const dadosApi = await buscarDadosPokemon(nomeOriginal);

    
    if (!dadosApi) {
        feedback.textContent = '❌ O pokemon não foi encontrado.';
        feedback.style.color = 'red';
        return;
    }

    const imagem = extrairImagemPokemon(dadosApi);
    const tipos = extrairTipoPokemon(dadosApi);
    const cp = extrairCombatPower(dadosApi);

    // visual nos inputs
    inputTipo.value = tipos.join(', ');
    inputCp.value = cp;

    // adiciona ao estado  no caso o (array) em vez de jogar direto no HTML
    pokemonsNaArena.push({
        nome: dadosApi.name,
        imagem: imagem,
        tipos: tipos,
        cp: cp,
        treinador: treinadorInput
    });

    // refaz a tela atualizada 
    renderizarArena();

    feedback.textContent = '✅ Pokémon cadastrado com sucesso!';
    feedback.style.color = 'green';
    
    // limpa o formulário 
    form.reset();
    setTimeout(() => {
        inputTipo.value = '';
        inputCp.value = '';
    }, 2000);
});