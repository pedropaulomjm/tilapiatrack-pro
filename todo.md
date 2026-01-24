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
