package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.order.OrderDtoNew;
import ru.perminov.tender.dto.order.OrderDtoUpdate;
import ru.perminov.tender.mapper.OrderMapper;
import ru.perminov.tender.model.Order;
import ru.perminov.tender.repository.CompanyRepository;
import ru.perminov.tender.repository.MaterialRepository;
import ru.perminov.tender.repository.OrderRepository;
import ru.perminov.tender.repository.ProjectRepository;
import ru.perminov.tender.service.OrderService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CompanyRepository companyRepository;
    private final ProjectRepository projectRepository;
    private final MaterialRepository materialRepository;
    private final OrderMapper orderMapper;


    @Override
    @Transactional
    public Order create(OrderDtoNew orderDtoNew) {
    Order order = orderMapper.toOrder(orderDtoNew);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order update(UUID id, OrderDtoUpdate orderDtoUpdate) {
        Order existingOrder = getById(id);
        orderMapper.updateOrderFromDto(orderDtoUpdate, existingOrder);

        if (orderDtoUpdate.companyId() != null) {
            existingOrder.setCompany(companyRepository.findById(orderDtoUpdate.companyId())
                    .orElseThrow(() -> new RuntimeException("Company not found with id: " + orderDtoUpdate.companyId())));
        }
        if (orderDtoUpdate.projectId() != null) {
            existingOrder.setProject(projectRepository.findById(orderDtoUpdate.projectId())
                    .orElseThrow(() -> new RuntimeException("Project not found with id: " + orderDtoUpdate.projectId())));
        }
        if (orderDtoUpdate.materialIds() != null) {
            existingOrder.setMaterials(orderDtoUpdate.materialIds().stream()
                    .map(materialRepository::findById)
                    .map(material -> material.orElseThrow(() -> new RuntimeException("Material not found with id: " + material)))
                    .collect(Collectors.toList()));
        }
        return orderRepository.save(existingOrder);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        orderRepository.deleteById(id);
    }

    @Override
    public Order getById(UUID id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    @Override
    public List<Order> getAll() {
        return orderRepository.findAll();
    }
} 