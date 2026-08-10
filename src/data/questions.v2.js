export const instrumentVersion = "2.0";

export const frequencyOptions = [
  { value: 1, label: "Nunca" }, { value: 2, label: "Raramente" },
  { value: 3, label: "Às vezes" }, { value: 4, label: "Frequentemente" },
  { value: 5, label: "Quase sempre" },
];

const behavioral = (id, competencyId, text, metadata = {}) => ({ id, competencyId, type: "behavioral", text, ...metadata });
const situational = (id, competencyId, scenario, options, metadata = {}) => ({
  id, competencyId, type: "situational", scenario,
  prompt: "Qual atitude mais se aproxima do que você faria?",
  options: options.map(([text, value], index) => ({ id: String.fromCharCode(97 + index), text, value })),
  ...metadata,
});

export const statements = [
  behavioral("comunicacao_01", "comunicacao", "Ao explicar uma decisão de design, adapto meus argumentos ao conhecimento e aos interesses de quem está ouvindo."),
  behavioral("comunicacao_02", "comunicacao", "Consigo explicar decisões complexas de forma simples sem perder informações importantes."),
  behavioral("comunicacao_03", "comunicacao", "Quando percebo que minha mensagem não foi compreendida, tento outra forma de explicá-la em vez de apenas repeti-la."),
  situational("comunicacao_04", "comunicacao", "Você precisa apresentar uma decisão de design para uma pessoa que não tem familiaridade com UX. Ela questiona por que uma solução aparentemente “mais bonita” não foi escolhida.", [["Reforço que a equipe de design estudou as alternativas.",1],["Explico os critérios técnicos utilizados na decisão.",3],["Mostro os critérios relacionando-os aos objetivos do produto e ao impacto para o usuário.",5],["Mostro as duas alternativas e deixo a pessoa decidir.",2],["Pergunto o que ela valoriza na alternativa e uso isso para contextualizar minha explicação.",4]]),
  situational("comunicacao_05", "comunicacao", "Durante uma apresentação você percebe, pelas perguntas, que parte do grupo interpretou sua proposta de maneira diferente do que pretendia.", [["Continuo a apresentação e esclareço ao final.",2],["Retomo imediatamente a explicação exatamente como havia planejado.",1],["Pergunto o que foi compreendido antes de reformular a explicação.",5],["Apresento um exemplo concreto para esclarecer a ideia.",4],["Faço uma explicação mais detalhada tecnicamente.",3]]),

  behavioral("empatia_01", "empatia", "Antes de avaliar o comportamento de alguém, procuro compreender o contexto em que aquela pessoa está inserida."),
  behavioral("empatia_02", "empatia", "Consigo considerar uma perspectiva diferente da minha mesmo quando não concordo com ela."),
  behavioral("empatia_03", "empatia", "Ao projetar uma solução, procuro compreender necessidades que eu próprio não vivencio."),
  situational("empatia_04", "empatia", "Em uma pesquisa, um usuário tem muita dificuldade para realizar uma tarefa que você considera bastante simples.", [["Registro a dificuldade como um problema de usabilidade.",4],["Pergunto o que ele esperava encontrar e tento compreender seu raciocínio.",5],["Considero que provavelmente falta familiaridade do usuário com aquele tipo de interface.",1],["Observo outros usuários antes de considerar aquilo um problema.",3],["Pergunto se ele costuma utilizar produtos semelhantes.",2]]),
  situational("empatia_05", "empatia", "Um colega reage negativamente a uma crítica relativamente simples sobre seu trabalho.", [["Evito continuar o assunto para não aumentar o conflito.",2],["Explico que minha intenção não era criticá-lo pessoalmente.",3],["Procuro compreender o que pode ter provocado aquela reação antes de continuar.",5],["Dou algum tempo e depois tento retomar a conversa.",4],["Considero que a reação foi desproporcional à situação.",1]]),

  behavioral("inteligencia_emocional_01", "inteligencia_emocional", "Percebo quando meu estado emocional está começando a influenciar minhas decisões profissionais."),
  behavioral("inteligencia_emocional_02", "inteligencia_emocional", "Consigo identificar o que estou sentindo antes de decidir como reagir a uma situação difícil."),
  behavioral("inteligencia_emocional_03", "inteligencia_emocional", "Depois de uma situação emocionalmente difícil, consigo recuperar o foco sem permanecer preso ao episódio por muito tempo."),
  situational("inteligencia_emocional_04", "inteligencia_emocional", "Você trabalhou vários dias em uma proposta. Na apresentação, alguém afirma diante do time que ela “não resolve o problema”.", [["Explico imediatamente os argumentos que sustentam a solução.",2],["Pergunto quais aspectos da proposta levaram a essa conclusão.",5],["Evito responder até ter tempo para processar a crítica.",3],["Reconheço meu incômodo internamente e procuro concentrar a conversa nos argumentos apresentados.",4],["Espero outras pessoas se posicionarem antes de responder.",1]]),
  situational("inteligencia_emocional_05", "inteligencia_emocional", "Você percebe que está bastante irritado durante uma discussão sobre um projeto.", [["Continuo defendendo meu ponto, tentando controlar o tom.",2],["Digo que prefiro interromper a discussão naquele momento.",3],["Reconheço meu estado, desacelero a reação e tento compreender o que está provocando o conflito.",5],["Procuro trazer a conversa novamente para fatos e critérios objetivos.",4],["Falo menos e espero a discussão terminar.",1]]),

  behavioral("pensamento_critico_01", "pensamento_critico", "Antes de defender uma solução, procuro distinguir evidências, interpretações e opiniões."),
  behavioral("pensamento_critico_02", "pensamento_critico", "Questiono minhas próprias premissas com a mesma disposição com que questiono as ideias de outras pessoas."),
  behavioral("pensamento_critico_03", "pensamento_critico", "Mudo de opinião quando surgem evidências mais consistentes do que aquelas que sustentavam minha posição anterior."),
  situational("pensamento_critico_04", "pensamento_critico", "Seu time prefere a solução A. Um teste com poucos usuários sugere que a solução B pode funcionar melhor.", [["Escolho B porque dados de usuários devem prevalecer.",3],["Mantenho A porque a amostra do teste é pequena.",2],["Investigo as limitações das evidências antes de decidir entre A e B.",5],["Apresento os resultados ao time e proponho uma nova rodada de validação.",4],["Sigo a decisão da maioria do time.",1]], { behavioralPattern: "evidence_over_assumption", tags: ["evidence", "uncertainty", "decision"] }),
  situational("pensamento_critico_05", "pensamento_critico", "Um stakeholder afirma: “Nossos usuários sempre pedem essa funcionalidade”.", [["Considero a informação porque ele conhece o negócio.",2],["Pergunto de onde vem essa percepção e quais evidências a sustentam.",5],["Sugiro validar a necessidade antes de priorizar a funcionalidade.",4],["Comparo a solicitação com produtos concorrentes.",3],["Registro a solicitação para discutir na priorização.",1]]),

  behavioral("colaboracao_01", "colaboracao", "Compartilho informações relevantes mesmo quando isso reduz minha vantagem individual em uma discussão."),
  behavioral("colaboracao_02", "colaboracao", "Consigo incorporar contribuições de outras pessoas sem sentir que a solução deixa de ser “minha”."),
  behavioral("colaboracao_03", "colaboracao", "Quando há divergência, procuro construir critérios comuns antes de defender uma solução específica."),
  situational("colaboracao_04", "colaboracao", "Você acredita fortemente na solução A, mas duas pessoas do time defendem B.", [["Tento demonstrar por que A é tecnicamente superior.",2],["Aceito B para evitar prolongar a discussão.",1],["Proponho definir critérios comuns e comparar A e B usando esses critérios.",5],["Sugiro testar as duas alternativas.",4],["Peço que cada pessoa apresente seus argumentos antes da decisão.",3]]),
  situational("colaboracao_05", "colaboracao", "Uma ideia sua recebe elogios em uma reunião, mas parte importante dela surgiu de uma conversa com outro designer.", [["Agradeço e sigo a reunião.",1],["Comento posteriormente com o colega.",2],["Explico que a solução evoluiu a partir do trabalho conjunto.",5],["Menciono a contribuição do colega quando houver oportunidade.",4],["Compartilho os créditos caso alguém pergunte como surgiu a ideia.",3]]),

  behavioral("adaptabilidade_01", "adaptabilidade", "Quando uma prioridade muda, consigo reorganizar meu trabalho sem permanecer preso ao plano anterior."),
  behavioral("adaptabilidade_02", "adaptabilidade", "Reavalio métodos que funcionaram no passado quando o contexto muda."),
  behavioral("adaptabilidade_03", "adaptabilidade", "Consigo avançar mesmo quando ainda não tenho todas as informações que gostaria."),
  situational("adaptabilidade_04", "adaptabilidade", "Você trabalhou uma semana em uma solução e uma mudança de negócio torna boa parte dela inviável.", [["Tento preservar o máximo possível do trabalho realizado.",2],["Reavalio o problema considerando o novo cenário antes de decidir o que aproveitar.",5],["Começo uma nova solução do zero.",3],["Identifico quais aprendizados e componentes ainda são úteis.",4],["Aguardo maior definição antes de continuar.",1]]),
  situational("adaptabilidade_05", "adaptabilidade", "Seu time decide adotar uma ferramenta que você nunca utilizou e que substituirá uma ferramenta que domina.", [["Continuo usando a anterior enquanto for possível.",1],["Aprendo apenas o necessário para executar minhas tarefas.",2],["Exploro a nova ferramenta e comparo como ela altera meu processo de trabalho.",5],["Procuro treinamento ou materiais para acelerar a adaptação.",4],["Peço ajuda a colegas que já a conhecem.",3]]),

  behavioral("escuta_ativa_01", "escuta_ativa", "Durante uma conversa, consigo perceber quando estou preparando minha resposta em vez de realmente ouvir."),
  behavioral("escuta_ativa_02", "escuta_ativa", "Faço perguntas para aprofundar o que a pessoa quis dizer antes de apresentar minha interpretação."),
  behavioral("escuta_ativa_03", "escuta_ativa", "Consigo ouvir uma crítica inteira antes de começar a formular minha defesa."),
  situational("escuta_ativa_04", "escuta_ativa", "Durante uma entrevista, um usuário diz: “Eu não gosto dessa tela.”", [["Pergunto o que ele mudaria.",3],["Pergunto o que exatamente faz com que ele se sinta dessa forma.",5],["Registro que a percepção da tela foi negativa.",2],["Pergunto como ele esperava que a tela funcionasse.",4],["Mostro outra alternativa para comparar.",1]]),
  situational("escuta_ativa_05", "escuta_ativa", "Enquanto um colega explica uma ideia, você percebe um problema importante no raciocínio dele.", [["Interrompo para evitar que a discussão avance sobre uma premissa errada.",1],["Espero terminar e apresento o problema que identifiquei.",3],["Escuto o raciocínio completo e depois confirmo se compreendi antes de questioná-lo.",5],["Anoto o ponto para discutir posteriormente.",4],["Faço uma pergunta imediatamente para direcionar o raciocínio.",2]]),

  behavioral("lideranca_01", "lideranca", "Quando uma decisão da qual participei produz um resultado ruim, assumo minha parcela de responsabilidade."),
  behavioral("lideranca_02", "lideranca", "Estimulo pessoas mais quietas ou menos experientes a contribuírem nas discussões."),
  behavioral("lideranca_03", "lideranca", "Consigo oferecer feedback sobre um problema sem transformar a conversa em julgamento da pessoa."),
  situational("lideranca_04", "lideranca", "Um designer menos experiente apresenta uma solução que você acredita ter problemas importantes.", [["Aponto os problemas e mostro como eu resolveria.",2],["Faço perguntas para ajudá-lo a perceber os problemas e desenvolver a própria solução.",5],["Sugiro algumas alterações e deixo que ele decida.",4],["Deixo que teste a solução e descubra os problemas.",3],["Corrijo a solução para evitar impacto no projeto.",1]]),
  situational("lideranca_05", "lideranca", "Uma decisão tomada pelo grupo, da qual você participou, acaba produzindo um resultado ruim.", [["Explico quais fatores levaram o grupo à decisão.",2],["Identifico quem tinha responsabilidade pela decisão final.",1],["Reconheço minha participação, analiso o que aprendemos e ajudo a definir próximos passos.",5],["Concentro a discussão no que precisa ser corrigido agora.",3],["Proponho uma retrospectiva para entender o processo que levou ao erro.",4]]),

  behavioral("aprendizado_01", "aprendizado", "Reservo deliberadamente tempo para desenvolver conhecimentos que ainda não domino."),
  behavioral("aprendizado_02", "aprendizado", "Transformo novos conhecimentos em experimentos ou mudanças concretas na minha prática."),
  behavioral("aprendizado_03", "aprendizado", "Busco referências fora do universo do Design quando elas podem ampliar minha compreensão de um problema."),
  situational("aprendizado_04", "aprendizado", "Você percebe que uma tecnologia nova começa a aparecer frequentemente em vagas e projetos da sua área.", [["Espero entender se ela realmente se consolidará antes de investir tempo.",2],["Faço um curso completo sobre ela.",3],["Investigo seu impacto, experimento em pequena escala e avalio sua relevância para minha atuação.",5],["Acompanho conteúdos sobre o assunto para entender sua evolução.",4],["Continuo priorizando as competências que já utilizo no trabalho.",1]]),
  situational("aprendizado_05", "aprendizado", "Você recebe um feedback indicando uma deficiência em uma competência que considerava um ponto forte.", [["Tento entender por que a pessoa teve essa percepção.",4],["Comparo o feedback com avaliações de outras pessoas.",3],["Procuro evidências no meu comportamento e, se fizer sentido, experimento formas de melhorar.",5],["Considero o feedback, mas mantenho minha avaliação sobre essa competência.",2],["Entendo como uma percepção individual daquela pessoa.",1]]),

  behavioral("proposito_01", "proposito", "Consigo identificar quais valores influenciam minhas principais decisões profissionais."),
  behavioral("proposito_02", "proposito", "Tenho clareza sobre o tipo de impacto que gostaria de produzir por meio do meu trabalho."),
  behavioral("proposito_03", "proposito", "Reavalio periodicamente se minhas escolhas profissionais continuam coerentes com a direção que quero seguir."),
  situational("proposito_04", "proposito", "Você recebe uma oportunidade profissional financeiramente atraente, mas percebe que alguns aspectos entram em conflito com valores importantes para você.", [["Aceito porque oportunidades profissionais também precisam ser avaliadas financeiramente.",1],["Avalio se consigo conviver com esses conflitos considerando os benefícios da oportunidade.",3],["Identifico quais valores estão sendo tensionados e avalio conscientemente os trade-offs antes de decidir.",5],["Converso com pessoas de confiança antes de tomar uma decisão.",4],["Recuso porque valores pessoais devem prevalecer sobre oportunidades profissionais.",2]]),
  situational("proposito_05", "proposito", "Você percebe que sua rotina profissional está cada vez mais distante do tipo de trabalho que gostaria de realizar no futuro.", [["Continuo priorizando as responsabilidades atuais enquanto penso no assunto.",2],["Procuro oportunidades diferentes imediatamente.",3],["Reavalio a direção desejada e começo a definir mudanças possíveis de forma planejada.",5],["Converso com pessoas que atuam nas áreas que me interessam.",4],["Considero que essa distância é uma consequência normal da vida profissional.",1]]),
].map((item, index) => ({ ...item, order: index + 1, isReverseScored: false }));

export const openQuestions = [
  "Qual situação profissional tem exigido mais de você comportamentalmente nos últimos meses?",
  "Que comportamento seu você gostaria de conseguir mudar ou desenvolver?",
  "Se você pudesse melhorar uma única coisa na forma como trabalha com outras pessoas, o que escolheria?",
];
