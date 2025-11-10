# Kubernetes Deployment Guide - Viajero Conectado

This directory contains Kubernetes manifests for deploying Viajero Conectado to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (v1.25+)
- kubectl configured
- Helm (for cert-manager and nginx-ingress)
- Docker images built and pushed to registry

## Quick Start

### 1. Create Namespace

```bash
kubectl apply -f namespace.yaml
```

### 2. Create Secrets

```bash
# Copy and edit the secrets example
cp secrets.yaml.example secrets.yaml
nano secrets.yaml

# Apply secrets (DO NOT commit this file!)
kubectl apply -f secrets.yaml
```

### 3. Apply ConfigMap

```bash
kubectl apply -f configmap.yaml
```

### 4. Deploy Databases

```bash
# PostgreSQL
kubectl apply -f postgres-deployment.yaml

# MongoDB (optional, create similarly)
kubectl apply -f mongodb-deployment.yaml

# Redis (optional, create similarly)
kubectl apply -f redis-deployment.yaml

# Elasticsearch (optional, create similarly)
kubectl apply -f elasticsearch-deployment.yaml
```

### 5. Deploy Applications

```bash
# Backend
kubectl apply -f backend-deployment.yaml

# Frontend
kubectl apply -f frontend-deployment.yaml
```

### 6. Setup Ingress

#### Install Nginx Ingress Controller

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer
```

#### Install Cert-Manager

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update

helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true
```

#### Apply Ingress

```bash
kubectl apply -f ingress.yaml
```

## Verification

### Check Deployments

```bash
kubectl get deployments -n viajero-conectado
kubectl get pods -n viajero-conectado
kubectl get services -n viajero-conectado
```

### Check Ingress

```bash
kubectl get ingress -n viajero-conectado
kubectl describe ingress viajero-ingress -n viajero-conectado
```

### Check Logs

```bash
# Backend logs
kubectl logs -f deployment/viajero-backend -n viajero-conectado

# Frontend logs
kubectl logs -f deployment/viajero-frontend -n viajero-conectado
```

### Test Health Endpoints

```bash
# Get ingress IP
kubectl get ingress viajero-ingress -n viajero-conectado

# Test backend
curl https://api.viajeroconectado.com/api/v1/health

# Test frontend
curl https://viajeroconectado.com/api/health
```

## Scaling

### Manual Scaling

```bash
# Scale backend
kubectl scale deployment viajero-backend --replicas=5 -n viajero-conectado

# Scale frontend
kubectl scale deployment viajero-frontend --replicas=5 -n viajero-conectado
```

### Auto-scaling (HPA)

HPA is already configured in the deployment files:

```bash
# Check HPA status
kubectl get hpa -n viajero-conectado

# Describe HPA
kubectl describe hpa viajero-backend-hpa -n viajero-conectado
```

## Updates & Rollouts

### Update Image

```bash
# Update backend
kubectl set image deployment/viajero-backend \
  viajero-backend=ghcr.io/your-org/viajero-backend:v1.1.0 \
  -n viajero-conectado

# Update frontend
kubectl set image deployment/viajero-frontend \
  viajero-frontend=ghcr.io/your-org/viajero-frontend:v1.1.0 \
  -n viajero-conectado
```

### Check Rollout Status

```bash
kubectl rollout status deployment/viajero-backend -n viajero-conectado
kubectl rollout status deployment/viajero-frontend -n viajero-conectado
```

### Rollback

```bash
# Rollback backend
kubectl rollout undo deployment/viajero-backend -n viajero-conectado

# Rollback to specific revision
kubectl rollout undo deployment/viajero-backend --to-revision=2 -n viajero-conectado
```

## Monitoring

### Resource Usage

```bash
# Get resource usage
kubectl top pods -n viajero-conectado
kubectl top nodes
```

### Events

```bash
kubectl get events -n viajero-conectado --sort-by='.lastTimestamp'
```

## Troubleshooting

### Pod Not Starting

```bash
# Describe pod
kubectl describe pod <pod-name> -n viajero-conectado

# Check logs
kubectl logs <pod-name> -n viajero-conectado

# Check previous container logs (if crashed)
kubectl logs <pod-name> -n viajero-conectado --previous
```

### Service Not Reachable

```bash
# Check service endpoints
kubectl get endpoints -n viajero-conectado

# Test service from within cluster
kubectl run -it --rm debug --image=alpine --restart=Never -- sh
# Inside pod: wget -O- http://viajero-backend:4000/api/v1/health
```

### Database Connection Issues

```bash
# Check database pod
kubectl get pods -n viajero-conectado | grep postgres

# Exec into database
kubectl exec -it <postgres-pod> -n viajero-conectado -- psql -U postgres

# Check database service
kubectl get svc postgres -n viajero-conectado
```

## Cleanup

### Delete All Resources

```bash
# Delete ingress first
kubectl delete -f ingress.yaml

# Delete applications
kubectl delete -f backend-deployment.yaml
kubectl delete -f frontend-deployment.yaml

# Delete databases
kubectl delete -f postgres-deployment.yaml

# Delete config
kubectl delete -f configmap.yaml
kubectl delete -f secrets.yaml

# Delete namespace (this will delete everything in it)
kubectl delete namespace viajero-conectado
```

## Production Recommendations

1. **Use Managed Databases**: Consider using managed PostgreSQL, MongoDB, and Redis services instead of running them in Kubernetes

2. **Secrets Management**: Use a secrets management solution:
   - HashiCorp Vault
   - AWS Secrets Manager
   - External Secrets Operator
   - Sealed Secrets

3. **Persistent Storage**: Configure persistent volumes with backup strategies

4. **Resource Limits**: Always set resource requests and limits

5. **Network Policies**: Implement network policies to restrict pod-to-pod communication

6. **Security**:
   - Use Pod Security Policies/Pod Security Standards
   - Run containers as non-root
   - Scan images for vulnerabilities
   - Keep Kubernetes updated

7. **Monitoring**: Set up monitoring with Prometheus and Grafana

8. **Logging**: Use ELK stack or similar for centralized logging

9. **Backups**: Regular database backups with automated restoration testing

10. **Disaster Recovery**: Have a documented DR plan and test it regularly

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Cert-Manager](https://cert-manager.io/)
- [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
