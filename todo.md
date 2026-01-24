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
