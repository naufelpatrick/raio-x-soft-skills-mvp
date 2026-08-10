export const instrumentVersion = "1.0";

export const likertOptions = [
  { value: 1, label: "Discordo totalmente" },
  { value: 2, label: "Discordo" },
  { value: 3, label: "Nem concordo nem discordo" },
  { value: 4, label: "Concordo" },
  { value: 5, label: "Concordo totalmente" },
];

const statementsByCompetency = {
  comunicacao: [["COM01", "Adapto minha forma de comunicar de acordo com o público e o contexto."], ["COM02", "Consigo explicar ideias complexas de maneira clara e objetiva."], ["COM03", "Antes de concluir uma conversa importante, procuro confirmar se minha mensagem foi compreendida."], ["COM04", "Quando preciso defender uma ideia, apresento argumentos e exemplos que ajudam as pessoas a compreender meu raciocínio."], ["COM05", "Tenho dificuldade para organizar minhas ideias quando preciso explicá-las a outras pessoas.", true]],
  empatia: [["EMP01", "Antes de formar uma opinião, procuro compreender o ponto de vista da outra pessoa."], ["EMP02", "Consigo perceber quando alguém está desconfortável, mesmo que essa pessoa não diga isso diretamente."], ["EMP03", "Ao discordar de alguém, procuro considerar as experiências e necessidades envolvidas na situação."], ["EMP04", "Ajusto minha abordagem quando percebo que uma pessoa precisa de mais apoio ou compreensão."], ["EMP05", "Tenho pouca paciência para considerar perspectivas muito diferentes da minha.", true]],
  inteligencia_emocional: [["IE01", "Consigo reconhecer como minhas emoções influenciam minhas decisões."], ["IE02", "Quando recebo uma crítica, procuro compreendê-la antes de responder defensivamente."], ["IE03", "Mesmo sob pressão, consigo manter uma postura respeitosa e produtiva."], ["IE04", "Percebo com facilidade quando uma situação está alterando meu estado emocional."], ["IE05", "Quando algo não acontece como esperado, minhas emoções costumam prejudicar minha capacidade de agir.", true]],
  pensamento_critico: [["PC01", "Antes de aceitar uma informação, procuro verificar sua fonte e suas evidências."], ["PC02", "Costumo analisar um problema por diferentes perspectivas antes de propor uma solução."], ["PC03", "Consigo identificar quando uma decisão está sendo baseada mais em suposições do que em fatos."], ["PC04", "Reavalio minhas opiniões quando encontro informações que contradizem o que eu acreditava."], ["PC05", "Quando uma solução parece funcionar, raramente questiono se existem alternativas melhores.", true]],
  colaboracao: [["COL01", "Ao trabalhar em grupo, procuro construir soluções em conjunto, em vez de apenas defender minhas ideias."], ["COL02", "Compartilho informações que podem ajudar outras pessoas a realizar melhor o trabalho."], ["COL03", "Consigo negociar prioridades quando existem diferentes interesses dentro da equipe."], ["COL04", "Reconheço e valorizo as contribuições das outras pessoas nos resultados alcançados."], ["COL05", "Prefiro realizar sozinho tarefas que poderiam ser construídas de forma colaborativa.", true]],
  adaptabilidade: [["ADA01", "Consigo reorganizar meu trabalho quando prioridades mudam de forma inesperada."], ["ADA02", "Tenho facilidade para experimentar novas ferramentas, métodos ou formas de trabalhar."], ["ADA03", "Quando uma estratégia não funciona, procuro alternativas em vez de insistir no mesmo caminho."], ["ADA04", "Consigo atuar de maneira produtiva mesmo quando ainda não tenho todas as informações."], ["ADA05", "Mudanças inesperadas costumam me impedir de avançar por um período prolongado.", true]],
  escuta_ativa: [["EA01", "Durante uma conversa, deixo a outra pessoa concluir o raciocínio antes de responder."], ["EA02", "Faço perguntas para compreender melhor o que a outra pessoa está tentando comunicar."], ["EA03", "Consigo resumir o que ouvi para confirmar se compreendi corretamente."], ["EA04", "Durante conversas importantes, presto atenção não apenas às palavras, mas também ao contexto e ao tom da pessoa."], ["EA05", "Enquanto alguém fala, frequentemente fico mais concentrado em preparar minha resposta do que em compreender a mensagem.", true]],
  lideranca: [["LID01", "Consigo ajudar um grupo a compreender prioridades e objetivos comuns."], ["LID02", "Quando uma decisão afeta outras pessoas, procuro envolvê-las ou explicar os critérios utilizados."], ["LID03", "Dou feedbacks claros, respeitosos e orientados ao desenvolvimento."], ["LID04", "Assumo responsabilidade pelas decisões e pelos resultados das iniciativas em que participo."], ["LID05", "Evito tomar decisões difíceis quando elas podem gerar desconforto ou discordância.", true]],
  aprendizado: [["AC01", "Busco aprender novos conhecimentos mesmo quando eles não são necessários para uma tarefa imediata."], ["AC02", "Costumo transformar feedbacks recebidos em ações concretas de desenvolvimento."], ["AC03", "Reviso experiências anteriores para entender o que poderia fazer de maneira diferente."], ["AC04", "Procuro acompanhar mudanças relevantes na minha área de atuação."], ["AC05", "Depois que aprendo uma forma de executar uma atividade, raramente procuro maneiras de aprimorá-la.", true]],
  proposito: [["PRO01", "Consigo relacionar minhas atividades profissionais com objetivos que considero significativos."], ["PRO02", "Minhas escolhas profissionais costumam estar alinhadas aos valores que considero importantes."], ["PRO03", "Compreendo como meu trabalho contribui para outras pessoas, para uma organização ou para a sociedade."], ["PRO04", "Ao tomar decisões de carreira, considero não apenas os benefícios imediatos, mas também o impacto de longo prazo."], ["PRO05", "Frequentemente realizo minhas atividades sem compreender por que elas são importantes.", true]],
};

export const statements = Object.entries(statementsByCompetency).flatMap(([competencyId, items]) =>
  items.map(([id, text, isReverseScored = false], index) => ({ id, competencyId, type: "behavioral", text, order: index + 1, isReverseScored }))
);

export const openQuestions = [
  "Qual é hoje o maior desafio comportamental da sua vida profissional?",
  "Qual competência você acredita precisar desenvolver com mais urgência?",
  "Existe alguma situação recorrente no trabalho que gera desconforto, insegurança ou dificuldade para você?",
];
