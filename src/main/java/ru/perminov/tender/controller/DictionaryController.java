package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.dictionary.*;
import ru.perminov.tender.mapper.*;
import ru.perminov.tender.model.*;
import ru.perminov.tender.repository.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/dictionaries")
@RequiredArgsConstructor
@Slf4j
public class DictionaryController {

    private final BrandRepository brandRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final CountryRepository countryRepository;
    private final WarrantyRepository warrantyRepository;
    
    private final BrandMapper brandMapper;
    private final ManufacturerMapper manufacturerMapper;
    private final CountryMapper countryMapper;
    private final WarrantyMapper warrantyMapper;

    // Бренды
    @GetMapping("/brands")
    public ResponseEntity<List<BrandDto>> getAllBrands() {
        log.info("Получение всех брендов");
        List<Brand> brands = brandRepository.findAll();
        List<BrandDto> brandDtos = brands.stream()
                .map(brandMapper::toDto)
                .toList();
        return ResponseEntity.ok(brandDtos);
    }

    @GetMapping("/brands/search")
    public ResponseEntity<List<BrandDto>> searchBrands(@RequestParam String term) {
        log.info("Поиск брендов по термину: {}", term);
        List<Brand> brands = brandRepository.findByNameContainingIgnoreCase(term);
        List<BrandDto> brandDtos = brands.stream()
                .map(brandMapper::toDto)
                .toList();
        return ResponseEntity.ok(brandDtos);
    }

    @PostMapping("/brands")
    public ResponseEntity<BrandDto> createBrand(@RequestBody BrandDto brandDto) {
        log.info("Создание нового бренда: {}", brandDto.getName());
        if (brandRepository.existsByName(brandDto.getName())) {
            log.warn("Бренд с именем '{}' уже существует", brandDto.getName());
            return ResponseEntity.badRequest().build();
        }
        
        Brand brand = brandMapper.toEntity(brandDto);
        Brand savedBrand = brandRepository.save(brand);
        BrandDto savedBrandDto = brandMapper.toDto(savedBrand);
        return ResponseEntity.ok(savedBrandDto);
    }

    @PutMapping("/brands/{id}")
    public ResponseEntity<BrandDto> updateBrand(@PathVariable UUID id, @RequestBody BrandDto brandDto) {
        log.info("Обновление бренда id={}: {}", id, brandDto.getName());
        if (!brandRepository.existsById(id)) {
            log.warn("Бренд с id={} не найден", id);
            return ResponseEntity.notFound().build();
        }
        
        Brand brand = brandRepository.findById(id).orElseThrow();
        brand.setName(brandDto.getName());
        brand.setDescription(brandDto.getDescription());
        Brand savedBrand = brandRepository.save(brand);
        BrandDto savedBrandDto = brandMapper.toDto(savedBrand);
        return ResponseEntity.ok(savedBrandDto);
    }

    @DeleteMapping("/brands/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable UUID id) {
        log.info("Удаление бренда id={}", id);
        if (!brandRepository.existsById(id)) {
            log.warn("Бренд с id={} не найден", id);
            return ResponseEntity.notFound().build();
        }
        
        brandRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Производители
    @GetMapping("/manufacturers")
    public ResponseEntity<List<ManufacturerDto>> getAllManufacturers() {
        log.info("Получение всех производителей");
        List<Manufacturer> manufacturers = manufacturerRepository.findAll();
        List<ManufacturerDto> manufacturerDtos = manufacturers.stream()
                .map(manufacturerMapper::toDto)
                .toList();
        return ResponseEntity.ok(manufacturerDtos);
    }

    @GetMapping("/manufacturers/search")
    public ResponseEntity<List<ManufacturerDto>> searchManufacturers(@RequestParam String term) {
        log.info("Поиск производителей по термину: {}", term);
        List<Manufacturer> manufacturers = manufacturerRepository.findByNameContainingIgnoreCase(term);
        List<ManufacturerDto> manufacturerDtos = manufacturers.stream()
                .map(manufacturerMapper::toDto)
                .toList();
        return ResponseEntity.ok(manufacturerDtos);
    }

    @PostMapping("/manufacturers")
    public ResponseEntity<ManufacturerDto> createManufacturer(@RequestBody ManufacturerDto manufacturerDto) {
        log.info("Создание нового производителя: {}", manufacturerDto.getName());
        if (manufacturerRepository.existsByName(manufacturerDto.getName())) {
            log.warn("Производитель с именем '{}' уже существует", manufacturerDto.getName());
            return ResponseEntity.badRequest().build();
        }
        
        Manufacturer manufacturer = manufacturerMapper.toEntity(manufacturerDto);
        Manufacturer savedManufacturer = manufacturerRepository.save(manufacturer);
        ManufacturerDto savedManufacturerDto = manufacturerMapper.toDto(savedManufacturer);
        return ResponseEntity.ok(savedManufacturerDto);
    }

    @PutMapping("/manufacturers/{id}")
    public ResponseEntity<ManufacturerDto> updateManufacturer(@PathVariable UUID id, @RequestBody ManufacturerDto manufacturerDto) {
        log.info("Обновление производителя id={}: {}", id, manufacturerDto.getName());
        if (!manufacturerRepository.existsById(id)) {
            log.warn("Производитель с id={} не найден", id);
            return ResponseEntity.notFound().build();
        }
        
        Manufacturer manufacturer = manufacturerRepository.findById(id).orElseThrow();
        manufacturer.setName(manufacturerDto.getName());
        manufacturer.setDescription(manufacturerDto.getDescription());
        manufacturer.setCountry(manufacturerDto.getCountry());
        Manufacturer savedManufacturer = manufacturerRepository.save(manufacturer);
        ManufacturerDto savedManufacturerDto = manufacturerMapper.toDto(savedManufacturer);
        return ResponseEntity.ok(savedManufacturerDto);
    }

    @DeleteMapping("/manufacturers/{id}")
    public ResponseEntity<Void> deleteManufacturer(@PathVariable UUID id) {
        log.info("Удаление производителя id={}", id);
        if (!manufacturerRepository.existsById(id)) {
            log.warn("Производитель с id={} не найден", id);
            return ResponseEntity.notFound().build();
        }
        
        manufacturerRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Страны
    @GetMapping("/countries")
    public ResponseEntity<List<CountryDto>> getAllCountries() {
        log.info("Получение всех стран");
        List<Country> countries = countryRepository.findAll();
        List<CountryDto> countryDtos = countries.stream()
                .map(countryMapper::toDto)
                .toList();
        return ResponseEntity.ok(countryDtos);
    }

    @GetMapping("/countries/search")
    public ResponseEntity<List<CountryDto>> searchCountries(@RequestParam String term) {
        log.info("Поиск стран по термину: {}", term);
        List<Country> countries = countryRepository.findByNameContainingIgnoreCase(term);
        List<CountryDto> countryDtos = countries.stream()
                .map(countryMapper::toDto)
                .toList();
        return ResponseEntity.ok(countryDtos);
    }

    @PostMapping("/countries")
    public ResponseEntity<CountryDto> createCountry(@RequestBody CountryDto countryDto) {
        log.info("Создание новой страны: {}", countryDto.getName());
        if (countryRepository.existsByName(countryDto.getName())) {
            log.warn("Страна с именем '{}' уже существует", countryDto.getName());
            return ResponseEntity.badRequest().build();
        }
        
        Country country = countryMapper.toEntity(countryDto);
        Country savedCountry = countryRepository.save(country);
        CountryDto savedCountryDto = countryMapper.toDto(savedCountry);
        return ResponseEntity.ok(savedCountryDto);
    }

    // Гарантии
    @GetMapping("/warranties")
    public ResponseEntity<List<WarrantyDto>> getAllWarranties() {
        log.info("Получение всех гарантий");
        List<Warranty> warranties = warrantyRepository.findAll();
        List<WarrantyDto> warrantyDtos = warranties.stream()
                .map(warrantyMapper::toDto)
                .toList();
        return ResponseEntity.ok(warrantyDtos);
    }

    @GetMapping("/warranties/search")
    public ResponseEntity<List<WarrantyDto>> searchWarranties(@RequestParam String term) {
        log.info("Поиск гарантий по термину: {}", term);
        List<Warranty> warranties = warrantyRepository.findByNameContainingIgnoreCase(term);
        List<WarrantyDto> warrantyDtos = warranties.stream()
                .map(warrantyMapper::toDto)
                .toList();
        return ResponseEntity.ok(warrantyDtos);
    }

    @PostMapping("/warranties")
    public ResponseEntity<WarrantyDto> createWarranty(@RequestBody WarrantyDto warrantyDto) {
        log.info("Создание новой гарантии: {}", warrantyDto.getName());
        if (warrantyRepository.existsByName(warrantyDto.getName())) {
            log.warn("Гарантия с именем '{}' уже существует", warrantyDto.getName());
            return ResponseEntity.badRequest().build();
        }
        
        Warranty warranty = warrantyMapper.toEntity(warrantyDto);
        Warranty savedWarranty = warrantyRepository.save(warranty);
        WarrantyDto savedWarrantyDto = warrantyMapper.toDto(savedWarranty);
        return ResponseEntity.ok(savedWarrantyDto);
    }

    @PutMapping("/warranties/{id}")
    public ResponseEntity<WarrantyDto> updateWarranty(@PathVariable UUID id, @RequestBody WarrantyDto warrantyDto) {
        log.info("Обновление гарантии id={}: {}", id, warrantyDto.getName());
        if (!warrantyRepository.existsById(id)) {
            log.warn("Гарантия с id={} не найдена", id);
            return ResponseEntity.notFound().build();
        }
        
        Warranty warranty = warrantyRepository.findById(id).orElseThrow();
        warranty.setName(warrantyDto.getName());
        warranty.setDescription(warrantyDto.getDescription());
        Warranty savedWarranty = warrantyRepository.save(warranty);
        WarrantyDto savedWarrantyDto = warrantyMapper.toDto(savedWarranty);
        return ResponseEntity.ok(savedWarrantyDto);
    }

    @DeleteMapping("/warranties/{id}")
    public ResponseEntity<Void> deleteWarranty(@PathVariable UUID id) {
        log.info("Удаление гарантии id={}", id);
        if (!warrantyRepository.existsById(id)) {
            log.warn("Гарантия с id={} не найдена", id);
            return ResponseEntity.notFound().build();
        }
        
        warrantyRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
} 