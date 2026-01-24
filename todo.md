# TilapiaTrack Pro - TODO

## Fase 1: Arquitetura e Banco de Dados
- [x] Definir esquema de banco de dados (tanques, parâmetros, alertas, usuários)
- [x] Configurar tabelas Drizzle ORM
- [x] Definir tipos e interfaces compartilhadas

## Fase 2: Autenticação e Gestão Básica
- [x] Implementar autenticação com Manus OAuth
- [x] Criar página de login/dashboard
- [x] Implementar CRUD de tanques
- [x] Criar formulário de cadastro de tanques
- [x] Implementar controle de acesso por roles (admin/usuário)

## Fase 3: Dashboard em Tempo Real
- [x] Criar layout do dashboard com sidebar
- [x] Implementar cards de indicadores de parâmetros (pH, temperatura, OD, amônia)
- [x] Integrar gráficos em tempo real com Recharts
- [x] Criar seletor de tanques
- [ ] Implementar visualização comparativa entre tanques
- [x] Adicionar status visual de alertas

## Fase 4: Sistema de Alertas
- [x] Criar tabela de alertas no banco de dados
- [x] Implementar lógica de detecção de limites críticos
- [x] Integrar notificações do Manus
- [ ] Criar página de histórico de alertas
- [x] Implementar configuração de limites por tanque

## Fase 5: API Webhook para Sensores IoT
- [x] Criar endpoint POST /api/webhooks/sensors
- [x] Implementar validação de dados de sensores
- [x] Implementar autenticação de webhook (token)
- [x] Armazenar dados em tempo real no banco
- [ ] Implementar rate limiting

## Fase 6: Histórico e Gráficos de Tendências
- [x] Criar página de histórico de dados
- [x] Implementar filtros por data e tanque
- [x] Criar gráficos de tendências temporais
- [ ] Implementar agregação de dados por período

## Fase 7: Relatórios e Exportação
- [x] Criar página de relatórios
- [x] Implementar exportação em CSV/PDF
- [x] Criar filtros avançados de período
- [x] Implementar visualização de estatísticas

## Fase 8: Análise Preditiva com LLM
- [x] Integrar invokeLLM para análise de padrões
- [x] Implementar procedimento de análise preditiva
- [ ] Criar página de insights e recomendações
- [x] Implementar previsão de riscos de mortalidade

## Fase 9: Relatórios Automáticos por Email
- [x] Criar tabela de configuração de relatórios
- [ ] Implementar job de geração de relatórios
- [ ] Integrar envio de emails
- [ ] Criar templates de relatórios

## Fase 10: Otimização e Entrega
- [ ] Testar responsividade em mobile
- [ ] Otimizar performance
- [x] Implementar testes vitest
- [ ] Revisar acessibilidade
- [ ] Criar checkpoint final


## Fase 11: Controle de Alimentação Automática
- [x] Criar tabelas de alimentadores e programações
- [x] Implementar interface de programação remota
- [x] Criar registro de quantidade de ração posta
- [x] Implementar cálculos de consumo diário/geral
- [x] Criar gráficos de consumo de ração

## Fase 12: Gestão de Estoque
- [x] Criar tabelas de itens de estoque e movimentações
- [x] Implementar entrada manual de itens
- [ ] Integrar entrada automática via scan de NF
- [x] Implementar cálculos de ponto de pedido
- [x] Criar histórico de movimentações
- [x] Implementar alertas de estoque baixo

## Fase 13: Gestão de Fornecedores
- [x] Criar tabela de fornecedores
- [x] Implementar cadastro e edição de contatos
- [x] Criar histórico de preços por fornecedor
- [x] Implementar comparativo de preços com gráficos
- [x] Criar relatório de fornecedores

## Fase 14: Análise Financeira
- [x] Criar tabelas de custos e receitas
- [x] Implementar dashboard de custos/lucros
- [x] Separar custos fixos/variáveis e diretos/indiretos
- [x] Implementar lançamento e remoção de vendas
- [x] Criar cálculos de KPIs financeiros
- [x] Implementar gráficos de análise financeira

## Fase 15: Referências Técnicas
- [x] Criar tabela de parâmetros de água de referência
- [x] Implementar interface de edição de parâmetros
- [x] Integrar referências com alertas

## Fase 16: Expansão de Tanques
- [x] Adicionar campos de densidade populacional
- [x] Adicionar campos de população
- [x] Adicionar campos de ciclo (alevinagem/juvenil/engorda)
- [x] Implementar registro de mortalidade
- [x] Implementar amostragem de peso
- [x] Implementar projeção de custo/lucro
- [x] Adicionar projeção de tempo para venda

## Fase 17: Feed de Câmera
- [x] Integrar feed de câmera de segurança
- [x] Implementar visualização em tempo real
- [x] Adicionar controles de câmera

## Fase 18: Exportação e Relatórios Avançados
- [ ] Implementar exportação em PDF
- [ ] Criar relatórios automáticos com KPIs
- [ ] Implementar gráficos em relatórios
- [ ] Criar relatórios por período

## Fase 19: Sincronização em Nuvem
- [x] Garantir sincronização de todos os dados editáveis
- [x] Implementar backup automático
- [x] Implementar versionamento de dados


## Fase 20: Painel de Controle Inicial
- [x] Criar Home Dashboard com KPIs principais
- [x] Implementar cards de resumo (receita, custo, lucro, margem)
- [x] Adicionar alertas críticos em destaque
- [x] Criar atalhos para principais funcionalidades
- [x] Implementar gráficos de resumo executivo

## Fase 21: Sistema de Notificações
- [x] Criar tabela de notificações
- [x] Implementar alertas visuais (toast/modal)
- [x] Implementar alertas sonoros
- [x] Criar centro de notificações com histórico
- [x] Integrar com alertas de estoque baixo
- [x] Integrar com alertas de parâmetros de água
- [x] Implementar configuração de preferências de notificação

## Fase 22: Módulo de Comparação de Preços
- [x] Criar página de análise de fornecedores
- [x] Implementar comparativo de preços por item
- [x] Criar gráficos de histórico de preços
- [x] Implementar análise de tendências de preços
- [x] Criar recomendações de melhor fornecedor
- [x] Implementar relatório de economia potencial


## Fase 23: Seletor de Páginas por Módulos
- [x] Criar componente ModuleSelector com categorias
- [x] Implementar navegação lateral com módulos
- [x] Agrupar páginas por categoria (Financeiro, Tanques, Estoque, etc)
- [x] Adicionar ícones e cores distintas por módulo
- [x] Implementar collapse/expand de categorias
- [x] Integrar ao layout principal
- [x] Testes de navegação


## Fase 24: Funcionalidade Real de Remoção
- [x] Adicionar mutações tRPC para deletar tanques
- [x] Adicionar mutações tRPC para deletar itens de estoque
- [x] Adicionar mutações tRPC para deletar fornecedores
- [x] Adicionar mutações tRPC para deletar alimentações
- [x] Implementar confirmação de deleção em modais
- [x] Adicionar feedback visual (toast) após remoção
- [x] Implementar otimistic updates
- [x] Testes de deleção


## Fase 25: Soft Delete e Trilha de Auditoria
- [x] Adicionar coluna deletedAt em todas as tabelas
- [x] Criar tabela de auditLog para rastrear mudanças
- [x] Implementar funções de soft delete
- [x] Implementar logging de auditoria
- [x] Criar dashboard de auditoria
- [x] Implementar filtros de auditoria (data, usuário, tipo)
- [x] Implementar funcionalidade de recuperação
- [x] Testes de soft delete e auditoria


## Fase 26: Parâmetros Ideais Globais por Espécie
- [x] Criar tabela de espécies de peixe
- [x] Criar tabela de parâmetros ideais por espécie
- [x] Implementar interface de configuração de espécies
- [x] Vincular tanques a espécies
- [x] Reutilizar parâmetros ideais em todos os tanques da mesma espécie
- [x] Testes de parâmetros globais

## Fase 27: Funcionalidade Real em Botões de Ação
- [x] Implementar ações em botões de alimentação
- [x] Implementar ações em botões de relatórios
- [x] Implementar ações em botões de configuração
- [x] Implementar ações em botões de análise
- [x] Testar todas as ações

## Fase 28: Análises Gerais da Operação
- [x] Dashboard de KPIs gerais
- [x] Gráficos de consumo total de ração
- [x] Gráficos de custos gerais
- [x] Gráficos de receitas gerais
- [x] Estatísticas de mortalidade geral
- [x] Comparativo de tanques em números

## Fase 29: Análises Específicas por Tanque
- [x] Dashboard de KPIs por tanque
- [x] Gráficos de parâmetros de água por tanque
- [x] Gráficos de consumo de ração por tanque
- [x] Gráficos de custos por tanque
- [x] Gráficos de receitas por tanque
- [x] Estatísticas de mortalidade por tanque

## Fase 30: Gráficos Comparativos
- [x] Comparativo de parâmetros entre tanques
- [x] Comparativo de consumo entre tanques
- [x] Comparativo de custos entre tanques
- [x] Comparativo de receitas entre tanques
- [x] Comparativo de mortalidade entre tanques
- [x] Testes de análises comparativas
