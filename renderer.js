
      const overlay = document.getElementById('overlay')
      
      document.getElementById('btn-minimize').addEventListener('click', () => {
        window.electronAPI.minimize()
      })
      document.getElementById('btn-close').addEventListener('click', () => {
        window.electronAPI.close()
      })
      
      let petsData = []
      let eggGroupsData = []
      let evolutionData = []
      let selectedPetId = null
      const yisePetsSet = new Set()
      
      const petModal = document.getElementById('pet-modal')
      const modalTitle = document.getElementById('modal-title')
      const modalBody = document.getElementById('modal-body')
      const modalClose = document.getElementById('modal-close')
      
      modalClose.addEventListener('click', () => {
        petModal.classList.remove('show')
      })
      
      petModal.addEventListener('click', (e) => {
        if (e.target === petModal) {
          petModal.classList.remove('show')
        }
      })
      
      async function loadPetsData() {
        try {
          const result = await window.electronAPI.loadPetsData()
          if (result.success) {
            const data = await window.electronAPI.getPetsData()
            petsData = data.pets
            eggGroupsData = data.eggGroups
            evolutionData = await window.electronAPI.getEvolutionData()
            
            const yiseChecks = petsData.map(async pet => {
              const yisePath = getImagePath(pet, 'yise')
              const hasYise = await window.electronAPI.checkFileExists(yisePath)
              if (hasYise) {
                yisePetsSet.add(pet.id)
              }
            })
            await Promise.all(yiseChecks)
            
            renderPetsGrid(petsData)
          } else {
            console.error('加载精灵数据失败:', result.error)
          }
        } catch (error) {
          console.error('加载精灵数据失败:', error)
        }
      }
      
      function getImagePath(pet, form = 'default') {
        const name = pet.name
        const formSuffix = form === 'default' ? '' : `_${form}`
        // 开发环境使用 public/ 前缀，打包后不需要
        const basePath = window.location.protocol === 'file:' ? 'public/' : ''
        return `${basePath}assets/webp/friends/JL_${name}${formSuffix}.webp`
      }
      
      async function getAvailableForms(pet) {
        const forms = ['default']
        const name = pet.name

        const shoulingPath = getImagePath(pet, 'shouling')
        const yisePath = getImagePath(pet, 'yise')

        const [hasShouling, hasYise] = await Promise.all([
          window.electronAPI.checkFileExists(shoulingPath),
          window.electronAPI.checkFileExists(yisePath)
        ])

        if (hasShouling) forms.push('shouling')
        if (hasYise) forms.push('yise')

        return forms
      }
      
      function getTypeBadgeClass(typeName) {
        return `type-${typeName}`
      }
      
      const petsGridContainer = document.getElementById('pets-grid')
      const gridCountEl = document.getElementById('grid-count')
      const pageInfoEl = document.getElementById('page-info')
      const prevPageBtn = document.getElementById('prev-page')
      const nextPageBtn = document.getElementById('next-page')
      const pageJumpInput = document.getElementById('page-jump-input')
      const pageJumpBtn = document.getElementById('page-jump-btn')
      
      let currentPage = 1
      let totalPages = 1
      let filteredPets = []
      const itemsPerPage = 24
      
      function renderPetsGrid(pets) {
        filteredPets = pets
        totalPages = Math.ceil(pets.length / itemsPerPage) || 1
        currentPage = Math.min(currentPage, totalPages)
        
        gridCountEl.textContent = `共 ${pets.length} 只精灵`
        
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        const pagePets = pets.slice(startIndex, endIndex)
        
        const fragment = document.createDocumentFragment()
        
        pagePets.forEach(pet => {
          const zhName = pet.localized?.zh?.name || pet.name
          const zhForm = pet.localized?.zh?.form
          const isLeader = pet.is_leader_form
          const displayId = pet.id
          const mainType = pet.main_type
          const subType = pet.sub_type
          
          const card = document.createElement('div')
          card.className = `pet-card ${selectedPetId === pet.id ? 'selected' : ''}`
          card.dataset.id = pet.id
          
          card.innerHTML = `
              <div class="pet-card-image-wrapper">
                <img loading="lazy" src="${getImagePath(pet)}" alt="${zhName}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22><rect fill=%22%23eee%22 width=%2264%22 height=%2264%22/><text x=%2232%22 y=%2236%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2216%22>?</text></svg>'">
                ${mainType ? `
                <div class="pet-card-types">
                  <span class="type-badge-mini ${getTypeBadgeClass(mainType.name)}">${mainType.localized?.zh || mainType.name}</span>
                  ${subType ? `<span class="type-badge-mini ${getTypeBadgeClass(subType.name)}">${subType.localized?.zh || subType.name}</span>` : ''}
                </div>
                ` : ''}
              </div>
              <span class="pet-card-id">#${String(displayId).padStart(3, '0')}</span>
              <span class="pet-card-name">${zhName}</span>
              ${isLeader ? `<span class="pet-card-form pet-card-leader">首领形态</span>` : ''}
              ${zhForm ? `<span class="pet-card-form">${zhForm}</span>` : ''}
          `
          
          fragment.appendChild(card)
        })
        
        petsGridContainer.innerHTML = ''
        petsGridContainer.appendChild(fragment)
        
        updatePagination()
        preloadNextPage()
      }
      
      function preloadNextPage() {
        if (currentPage >= totalPages) return
        
        const nextStartIndex = currentPage * itemsPerPage
        const nextEndIndex = nextStartIndex + itemsPerPage
        const nextPagePets = filteredPets.slice(nextStartIndex, nextEndIndex)
        
        nextPagePets.forEach(pet => {
          const img = new Image()
          img.src = getImagePath(pet)
        })
      }
      
      function updatePagination() {
        pageInfoEl.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`
        pageJumpInput.value = currentPage
        pageJumpInput.max = totalPages
        
        prevPageBtn.disabled = currentPage <= 1
        nextPageBtn.disabled = currentPage >= totalPages
      }
      
      function goToPage(page) {
        page = Math.max(1, Math.min(page, totalPages))
        if (page !== currentPage) {
          currentPage = page
          renderPetsGrid(filteredPets)
        }
      }
      
      prevPageBtn.addEventListener('click', () => {
        goToPage(currentPage - 1)
      })
      
      nextPageBtn.addEventListener('click', () => {
        goToPage(currentPage + 1)
      })
      
      pageJumpBtn.addEventListener('click', () => {
        const page = parseInt(pageJumpInput.value)
        if (!isNaN(page)) {
          goToPage(page)
        }
      })
      
      pageJumpInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const page = parseInt(pageJumpInput.value)
          if (!isNaN(page)) {
            goToPage(page)
          }
        }
      })
      
      document.addEventListener('wheel', (e) => {
        if (e.target.closest('.pet-modal') || e.target.closest('.about-modal')) {
          return
        }
        
        if (e.deltaY > 0) {
          if (currentPage < totalPages) {
            goToPage(currentPage + 1)
          }
        } else if (e.deltaY < 0) {
          if (currentPage > 1) {
            goToPage(currentPage - 1)
          }
        }
      }, { passive: true })
      
      petsGridContainer.addEventListener('click', async (e) => {
        const card = e.target.closest('.pet-card')
        if (!card) return
        
        const id = parseInt(card.dataset.id)
        selectPet(id)
        await openPetModal(id)
      })
      
      function selectPet(id) {
        selectedPetId = id
        
        petsGridContainer.querySelectorAll('.pet-card').forEach(card => {
          card.classList.toggle('selected', parseInt(card.dataset.id) === id)
        })
      }
      
      async function openPetModal(id) {
        try {
          const pet = await window.electronAPI.getPetDetail(id)
          if (pet) {
            renderPetModal(pet)
            petModal.classList.add('show')
          }
        } catch (error) {
          console.error('加载精灵详情失败:', error)
        }
      }
      
      async function getEvolutionChain(petId) {
        try {
          const petData = petsData.find(p => p.id === petId)
          if (!petData) return []
          
          const zhName = petData.localized?.zh?.name || petData.name
          
          let matchedChain = null
          
          for (const evoEntry of evolutionData) {
            if (!evoEntry.evolutionChain) continue
            
            for (let i = 0; i < evoEntry.evolutionChain.length; i++) {
              const step = evoEntry.evolutionChain[i]
              
              if (step.name === zhName) {
                matchedChain = evoEntry.evolutionChain
                break
              }
              
              if (step.branches && Array.isArray(step.branches)) {
                for (const branch of step.branches) {
                  if (branch.name === zhName) {
                    matchedChain = evoEntry.evolutionChain
                    break
                  }
                }
              }
            }
            
            if (matchedChain) break
          }
          
          if (!matchedChain) return []
          
          const chain = []
          
          for (const evoStep of matchedChain) {
            const matchingPet = petsData.find(p => {
              const pZhName = p.localized?.zh?.name || p.name
              return pZhName === evoStep.name
            })
            
            if (matchingPet) {
              let branchesData = []
              
              if (evoStep.branches && Array.isArray(evoStep.branches)) {
                for (const branch of evoStep.branches) {
                  const branchPet = petsData.find(p => {
                    const pZhName = p.localized?.zh?.name || p.name
                    return pZhName === branch.name
                  })
                  
                  if (branchPet) {
                    branchesData.push({
                      ...branchPet,
                      condition: branch.condition
                    })
                  }
                }
              }
              
              chain.push({
                ...matchingPet,
                condition: evoStep.condition,
                hasBranches: branchesData.length > 0,
                branches: branchesData
              })
            }
          }
          
          return chain
        } catch (error) {
          console.error('加载进化链数据失败:', error)
          return []
        }
      }
      
      function renderPetModal(pet) {
        const zhName = pet.localized?.zh?.name || pet.name
        const zhForm = pet.localized?.zh?.form
        const mainType = pet.main_type
        const subType = pet.sub_type
        const trait = pet.trait
        const breeding = pet.breeding
        const displayId = pet.id
        
        const maxStat = 200
        const stats = [
          { label: '生命', value: pet.base_hp, color: '#4caf50', id: 'stat-hp-left' },
          { label: '物攻', value: pet.base_phy_atk, color: '#ff6b35', id: 'stat-phy-atk-left' },
          { label: '魔攻', value: pet.base_mag_atk, color: '#4a9eff', id: 'stat-mag-atk-left' },
          { label: '物防', value: pet.base_phy_def, color: '#ff9800', id: 'stat-phy-def-left' },
          { label: '魔防', value: pet.base_mag_def, color: '#9c27b0', id: 'stat-mag-def-left' },
          { label: '速度', value: pet.base_spd, color: '#00bcd4', id: 'stat-spd-left' }
        ]
        
        const moves = pet.move_pool || []
        const moveStones = pet.move_stones || []
        const allMoves = [...moves, ...moveStones]
        
        function getCategoryClass(category) {
          const map = {
            'Physical Attack': 'move-category-physical',
            'Magic Attack': 'move-category-magic',
            'Status': 'move-category-status',
            'Defense': 'move-category-defense'
          }
          return map[category] || 'move-category-status'
        }
        
        function getCategoryName(category) {
          const map = {
            'Physical Attack': '物攻',
            'Magic Attack': '魔攻',
            'Status': '状态',
            'Defense': '防御'
          }
          return map[category] || '其他'
        }
        
        function renderMoveItem(move) {
          const moveName = move.localized?.zh?.name || move.name
          const moveDesc = move.localized?.zh?.description || move.description
          const categoryClass = getCategoryClass(move.move_category)
          const categoryName = getCategoryName(move.move_category)
          
          return `
            <div class="move-item">
              <div class="move-header">
                <div class="move-name">${moveName}</div>
                <span class="move-category ${categoryClass}">${categoryName}</span>
              </div>
              <div class="move-info">
                <span class="type-badge ${getTypeBadgeClass(move.move_type.name)}">${move.move_type.localized?.zh || move.move_type.name}</span>
                ${move.power ? `<span class="move-stat move-stat-power">⚡${move.power}</span>` : ''}
                <span class="move-stat move-stat-energy">🔵${move.energy_cost}</span>
              </div>
              ${moveDesc ? `<div class="move-desc">${moveDesc}</div>` : ''}
            </div>
          `
        }
        
        getAvailableForms(pet).then(async forms => {
          const hasMultipleForms = forms.length > 1
          
          const evolutionChain = await getEvolutionChain(pet.id)
          
          const hatchHours = breeding ? Math.round(breeding.hatch_data / 3600) : 0
          const hatchText = breeding ? (hatchHours >= 24 ? `${Math.round(hatchHours / 24)}天` : `${hatchHours}小时`) : '未知'
          const weightText = breeding ? `${(breeding.weight_low / 1000).toFixed(1)}-${(breeding.weight_high / 1000).toFixed(1)}kg` : '未知'
          const heightText = breeding ? `${breeding.height_low}-${breeding.height_high}cm` : '未知'
          const speciesName = pet.species?.localized?.zh?.name || pet.species?.name || '未知'
          
          const traitName = trait ? (trait.localized?.zh?.name || trait.name) : '无'
          const traitDesc = trait ? (trait.localized?.zh?.description || trait.description) : ''
          
          modalTitle.textContent = `${zhName} #${String(displayId).padStart(3, '0')}`
          document.getElementById('modal-pet-id').textContent = `#${String(displayId).padStart(3, '0')}`
          document.getElementById('modal-pet-name-large').textContent = zhName
          document.getElementById('modal-pet-form-large').textContent = zhForm || ''
          document.getElementById('info-hatch').textContent = hatchText
          document.getElementById('info-height').textContent = heightText
          document.getElementById('info-weight').textContent = weightText
          
          // 显示蛋组信息
          const eggGroups = eggGroupsData.find(egg => egg.name === zhName)?.groups || []
          const eggGroupsHtml = eggGroups.length > 0 
            ? eggGroups.map(group => `<span class="egg-group-badge">${group}</span>`).join('')
            : '<span class="egg-group-none">无法孵蛋组</span>'
          document.getElementById('egg-groups-list').innerHTML = eggGroupsHtml
          
          document.getElementById('info-trait').textContent = traitName
          document.getElementById('info-trait-desc').textContent = traitDesc
          document.getElementById('moves-count').textContent = `共 ${allMoves.length} 个`
          
          const typesHtml = `
            <span class="type-badge ${getTypeBadgeClass(mainType.name)}">${mainType.localized?.zh || mainType.name}</span>
            ${subType ? `<span class="type-badge ${getTypeBadgeClass(subType.name)}">${subType.localized?.zh || subType.name}</span>` : ''}
          `
          document.getElementById('modal-pet-types').innerHTML = typesHtml
          document.getElementById('modal-pet-types-large').innerHTML = typesHtml
          
          const imgSmall = document.getElementById('modal-header-img')
          imgSmall.src = getImagePath(pet, 'default')
          
          document.getElementById('pet-detail-image').src = getImagePath(pet, 'default')
          
          const formSwitcherHtml = hasMultipleForms ? `
            ${forms.includes('default') ? `<button class="form-btn active" data-form="default">普通</button>` : ''}
            ${forms.includes('shouling') ? `<button class="form-btn" data-form="shouling">👑 首领</button>` : ''}
            ${forms.includes('yise') ? `<button class="form-btn" data-form="yise">✨ 异色</button>` : ''}
          ` : ''
          document.getElementById('modal-form-switcher').innerHTML = formSwitcherHtml
          
          const statsHtml = stats.map(stat => `
            <div class="stat-row">
              <span class="stat-label">${stat.label}</span>
              <div class="stat-bar-container">
                <div class="stat-bar" style="width: ${(stat.value / maxStat) * 100}%; background: ${stat.color}"></div>
              </div>
              <span class="stat-value" id="${stat.id}">${stat.value}</span>
            </div>
          `).join('')
          document.getElementById('left-stats-section').innerHTML = statsHtml
          
          const itemsPerPage = 6
          const paginationState = {
            currentPage: 1,
            totalPages: Math.ceil(allMoves.length / itemsPerPage) || 1
          }
          
          function renderMovesPage() {
            const startIndex = (paginationState.currentPage - 1) * itemsPerPage
            const endIndex = startIndex + itemsPerPage
            const pageItems = allMoves.slice(startIndex, endIndex)
            
            const grid = document.getElementById('moves-grid')
            grid.innerHTML = pageItems.map(move => renderMoveItem(move)).join('')
            
            const pageInfo = document.getElementById('moves-page-info')
            const prevBtn = document.getElementById('moves-prev')
            const nextBtn = document.getElementById('moves-next')
            
            pageInfo.textContent = `第 ${paginationState.currentPage} / ${paginationState.totalPages} 页`
            prevBtn.disabled = paginationState.currentPage <= 1
            nextBtn.disabled = paginationState.currentPage >= paginationState.totalPages
          }
          
          document.getElementById('moves-prev').addEventListener('click', () => {
            if (paginationState.currentPage > 1) {
              paginationState.currentPage--
              renderMovesPage()
            }
          })
          document.getElementById('moves-next').addEventListener('click', () => {
            if (paginationState.currentPage < paginationState.totalPages) {
              paginationState.currentPage++
              renderMovesPage()
            }
          })
          
          renderMovesPage()
          
          modalBody.querySelectorAll('.form-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              const form = btn.dataset.form
              const img = document.getElementById('pet-detail-image')
              const imgSmall = document.getElementById('modal-header-img')
              img.src = getImagePath(pet, form)
              imgSmall.src = getImagePath(pet, form)
              
              modalBody.querySelectorAll('.form-btn').forEach(b => b.classList.remove('active'))
              btn.classList.add('active')
            })
          })
          
          const evolutionSection = document.querySelector('.evolution-section')
          
          if (pet.is_leader_form) {
            evolutionSection.style.display = 'none'
          } else {
            evolutionSection.style.display = 'block'
            
            const renderEvoNode = (evoPet, showArrow = false, arrowClass = '') => {
              const evoZhName = evoPet.localized?.zh?.name || evoPet.name
              const isCurrent = evoPet.id === pet.id
              const condition = evoPet.condition || ''
              
              return `
                <div class="evo-node ${isCurrent ? 'active' : ''}" data-pet-id="${evoPet.id}" style="cursor: pointer;">
                  <div class="evo-image-wrapper">
                    <img class="evo-img" src="${getImagePath(evoPet)}" alt="${evoZhName}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22><rect fill=%22%23eee%22 width=%2264%22 height=%2264%22/><text x=%2232%22 y=%2236%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2216%22>?</text></svg>'">
                  </div>
                  <div class="evo-info">
                    <div class="evo-name">${evoZhName}</div>
                    ${condition ? `<div class="evo-condition">${condition}</div>` : ''}
                  </div>
                  ${showArrow ? `<div class="evo-next-arrow ${arrowClass}">➜</div>` : ''}
                </div>
              `
            }
            
            let hasBranches = false
            let branchData = null
            
            for (const evoPet of evolutionChain) {
              if (evoPet.hasBranches && evoPet.branches.length > 0) {
                hasBranches = true
                branchData = { parent: evoPet, branches: evoPet.branches }
                break
              }
            }
            
            let evolutionChainHtml = ''
            
            if (hasBranches && branchData) {
              const mainNodes = evolutionChain.filter(e => 
                !branchData.branches.some(b => b.id === e.id)
              )
              
              const mainNodesHtml = mainNodes.map((node, index) => {
                const isLast = index === mainNodes.length - 1
                return renderEvoNode(node, !isLast)
              }).join('')
              
              const branchesHtml = branchData.branches.map((branch, bIndex) => {
                const arrowClass = bIndex === 0 ? 'arrow-up' : 'arrow-down'
                return `
                  <div class="evo-branch-item">
                    <div class="evo-next-arrow ${arrowClass}">➜</div>
                    ${renderEvoNode(branch, false)}
                  </div>
                `
              }).join('')
              
              evolutionChainHtml = `
                <div class="evo-row with-branches">
                  <div class="evo-main-chain">
                    ${mainNodesHtml}
                  </div>
                  <div class="evo-branches-container">
                    ${branchesHtml}
                  </div>
                </div>
              `
            } else {
              evolutionChainHtml = `
                <div class="evo-row">
                  ${evolutionChain.map((node, index) => {
                    const isLast = index === evolutionChain.length - 1
                    return renderEvoNode(node, !isLast)
                  }).join('')}
                </div>
              `
            }
            
            document.getElementById('evolution-chain').innerHTML = evolutionChainHtml
            
            // 添加进化节点点击事件
            document.querySelectorAll('.evo-node').forEach(node => {
              node.addEventListener('click', () => {
                const petId = node.dataset.petId
                if (petId && petId !== pet.id) {
                  openPetModal(petId)
                }
              })
            })
          }
        })
      }
      
      document.getElementById('search-input').addEventListener('input', () => {
        debounceSearch(applyFilters)
      })
      
      const selectedTypes = new Set()
      let dualTypeMode = false
      let selectedEggGroup = 'all'

      document.querySelectorAll('.type-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.dataset.type
          
          if (type === 'all') {
            selectedTypes.clear()
            dualTypeMode = false
            document.querySelectorAll('.type-filter-btn').forEach(b => {
              b.classList.remove('active', 'selected', 'dual-mode')
            })
            btn.classList.add('active')
            updateModeIndicator()
          } else {
            document.querySelector('.type-filter-btn[data-type="all"]').classList.remove('active')
            
            if (selectedTypes.has(type)) {
              selectedTypes.delete(type)
              btn.classList.remove('selected', 'dual-mode')
            } else {
              selectedTypes.add(type)
              btn.classList.add('selected')
            }
            
            if (selectedTypes.size === 2) {
              dualTypeMode = true
              document.querySelectorAll('.type-filter-btn.selected').forEach(b => {
                b.classList.add('dual-mode')
              })
            } else {
              dualTypeMode = false
              document.querySelectorAll('.type-filter-btn').forEach(b => {
                b.classList.remove('dual-mode')
              })
            }
            
            if (selectedTypes.size === 0) {
              document.querySelector('.type-filter-btn[data-type="all"]').classList.add('active')
            }
            
            updateModeIndicator()
          }
          
          applyFilters()
        })
      })

      document.querySelectorAll('.egg-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const group = btn.dataset.group
          selectedEggGroup = group
          document.querySelectorAll('.egg-filter-btn').forEach(b => b.classList.remove('active'))
          btn.classList.add('active')
          applyFilters()
        })
      })

      function updateModeIndicator() {
        const label = document.querySelector('.type-filter-label')
        if (dualTypeMode) {
          label.textContent = '双属性筛选：'
          label.style.color = '#667eea'
          label.style.fontWeight = '600'
        } else if (selectedTypes.size > 0) {
          label.textContent = '属性筛选：'
          label.style.color = '#666'
          label.style.fontWeight = '400'
        } else {
          label.textContent = '属性筛选：'
          label.style.color = '#666'
          label.style.fontWeight = '400'
        }
      }
      
      let searchDebounceTimer = null
      function debounceSearch(callback, delay = 150) {
        clearTimeout(searchDebounceTimer)
        searchDebounceTimer = setTimeout(callback, delay)
      }
      
      function applyFilters() {
        currentPage = 1
        const keyword = document.getElementById('search-input').value.toLowerCase()
        const isYiseFilter = selectedEggGroup === 'yise'

        const filtered = petsData.filter(pet => {
          const zhName = pet.localized?.zh?.name || ''
          const enName = pet.name.toLowerCase()
          const id = String(pet.id)
          const matchesKeyword = zhName.includes(keyword) || enName.includes(keyword) || id.includes(keyword)

          if (isYiseFilter) {
            return matchesKeyword && yisePetsSet.has(pet.id)
          }

          if (selectedTypes.size === 0) {
            if (selectedEggGroup === 'all') {
              return matchesKeyword
            }
            const eggInfo = eggGroupsData.find(e => e.name === zhName)
            return matchesKeyword && eggInfo && eggInfo.groups.includes(selectedEggGroup)
          }

          const mainType = pet.main_type?.name
          const subType = pet.sub_type?.name

          if (dualTypeMode && selectedTypes.size === 2) {
            const types = Array.from(selectedTypes)
            const hasType1 = mainType === types[0] || subType === types[0]
            const hasType2 = mainType === types[1] || subType === types[1]

            if (selectedEggGroup === 'all') {
              return matchesKeyword && hasType1 && hasType2
            }
            const eggInfo = eggGroupsData.find(e => e.name === zhName)
            return matchesKeyword && hasType1 && hasType2 && eggInfo && eggInfo.groups.includes(selectedEggGroup)
          }

          const matchesType = selectedTypes.has(mainType) || (subType && selectedTypes.has(subType))

          if (selectedEggGroup === 'all') {
            return matchesKeyword && matchesType
          }
          const eggInfo = eggGroupsData.find(e => e.name === zhName)
          return matchesKeyword && matchesType && eggInfo && eggInfo.groups.includes(selectedEggGroup)
        })
        
        requestAnimationFrame(() => {
          renderPetsGrid(filtered)
        })
      }
      
      loadPetsData()
      
      // 属性克制表颜色初始化
      const attrChartCells = document.querySelectorAll('.attr-chart-cell.attr-value')
      attrChartCells.forEach(cell => {
        const value = parseFloat(cell.textContent)
        if (value === 2) {
          cell.classList.add('super-effective')
        } else if (value === 0.5) {
          cell.classList.add('not-effective')
        } else {
          cell.classList.add('normal')
        }
      })
      
      // 查精灵功能
      const navPokedex = document.getElementById('nav-pokedex')
      const navSearchPet = document.getElementById('nav-search-pet')
      const navAttrChart = document.getElementById('nav-attr-chart')
      const navMap = document.getElementById('nav-map')
      const navSettings = document.getElementById('nav-settings')
      const navAbout = document.getElementById('nav-about')
      const pokedexGrid = document.getElementById('pokedex-grid')
      const searchPetContainer = document.getElementById('search-pet-container')
      const attrChartContainer = document.getElementById('attr-chart-container')
      const mapContainer = document.getElementById('map-container')
      const settingsContainer = document.getElementById('settings-container')
      const aboutContainer = document.getElementById('about-container')
      
      navPokedex.addEventListener('click', () => {
        navPokedex.classList.add('active')
        navSearchPet.classList.remove('active')
        navAttrChart.classList.remove('active')
        navMap.classList.remove('active')
        navSettings.classList.remove('active')
        navAbout.classList.remove('active')
        pokedexGrid.style.display = 'flex'
        searchPetContainer.style.display = 'none'
        attrChartContainer.classList.remove('active')
        mapContainer.classList.remove('active')
        settingsContainer.classList.remove('active')
        aboutContainer.style.display = 'none'
        window.electronAPI.hideMapView()
      })
      
      navSearchPet.addEventListener('click', () => {
        navSearchPet.classList.add('active')
        navPokedex.classList.remove('active')
        navAttrChart.classList.remove('active')
        navMap.classList.remove('active')
        navSettings.classList.remove('active')
        navAbout.classList.remove('active')
        pokedexGrid.style.display = 'none'
        searchPetContainer.style.display = 'block'
        attrChartContainer.classList.remove('active')
        mapContainer.classList.remove('active')
        settingsContainer.classList.remove('active')
        aboutContainer.style.display = 'none'
        window.electronAPI.hideMapView()
      })
      
      navAttrChart.addEventListener('click', () => {
        navAttrChart.classList.add('active')
        navPokedex.classList.remove('active')
        navSearchPet.classList.remove('active')
        navMap.classList.remove('active')
        navSettings.classList.remove('active')
        navAbout.classList.remove('active')
        pokedexGrid.style.display = 'none'
        searchPetContainer.style.display = 'none'
        attrChartContainer.classList.add('active')
        mapContainer.classList.remove('active')
        settingsContainer.classList.remove('active')
        aboutContainer.style.display = 'none'
        window.electronAPI.hideMapView()
      })
      
      navMap.addEventListener('click', () => {
        navMap.classList.add('active')
        navPokedex.classList.remove('active')
        navSearchPet.classList.remove('active')
        navAttrChart.classList.remove('active')
        navSettings.classList.remove('active')
        navAbout.classList.remove('active')
        pokedexGrid.style.display = 'none'
        searchPetContainer.style.display = 'none'
        attrChartContainer.classList.remove('active')
        mapContainer.classList.add('active')
        settingsContainer.classList.remove('active')
        aboutContainer.style.display = 'none'
        window.electronAPI.showMapView()
      })
      
      navSettings.addEventListener('click', () => {
        navSettings.classList.add('active')
        navPokedex.classList.remove('active')
        navSearchPet.classList.remove('active')
        navAttrChart.classList.remove('active')
        navMap.classList.remove('active')
        navAbout.classList.remove('active')
        pokedexGrid.style.display = 'none'
        searchPetContainer.style.display = 'none'
        attrChartContainer.classList.remove('active')
        mapContainer.classList.remove('active')
        settingsContainer.classList.add('active')
        aboutContainer.style.display = 'none'
        window.electronAPI.hideMapView()
      })
      
      navAbout.addEventListener('click', () => {
        navAbout.classList.add('active')
        navPokedex.classList.remove('active')
        navSearchPet.classList.remove('active')
        navAttrChart.classList.remove('active')
        navMap.classList.remove('active')
        navSettings.classList.remove('active')
        pokedexGrid.style.display = 'none'
        searchPetContainer.style.display = 'none'
        attrChartContainer.classList.remove('active')
        mapContainer.classList.remove('active')
        settingsContainer.classList.remove('active')
        aboutContainer.style.display = 'block'
        window.electronAPI.hideMapView()
      })
      
      // 关于界面链接点击事件
      const githubLink = document.getElementById('link-github')
      const bilibiliLink = document.getElementById('link-bilibili')
      
      githubLink.addEventListener('click', (e) => {
        e.preventDefault()
        const url = githubLink.getAttribute('data-url')
        window.electronAPI.openExternal(url)
      })
      
      bilibiliLink.addEventListener('click', (e) => {
        e.preventDefault()
        const url = bilibiliLink.getAttribute('data-url')
        window.electronAPI.openExternal(url)
      })
      
      const searchPetBtn = document.getElementById('search-pet-btn')
      const resetSearchBtn = document.getElementById('reset-search-btn')
      const resultsCount = document.getElementById('results-count')
      const searchResultsGrid = document.getElementById('search-results-grid')
      
      searchPetBtn.addEventListener('click', () => {
        const heightM = parseFloat(document.getElementById('pet-height').value) || 0
        const weight = parseFloat(document.getElementById('pet-weight').value) || 0
        
        // 将米转换为厘米
        const heightCm = heightM * 100
        
        // 先过滤出符合条件的精灵
        const filteredPets = petsData.filter(pet => {
          const breeding = pet.breeding
          if (!breeding) return false
          
          // 排除首领形态
          if (pet.is_leader_form) return false
          
          const heightLow = breeding.height_low
          const heightHigh = breeding.height_high
          const weightLow = breeding.weight_low / 1000
          const weightHigh = breeding.weight_high / 1000
          
          const heightMatches = heightCm >= heightLow && heightCm <= heightHigh
          const weightMatches = weight >= weightLow && weight <= weightHigh
          
          return heightMatches && weightMatches
        })
        
        // 多个形态的只显示一只（按 id 分组，取每组第一个）
        const uniquePetsMap = new Map()
        filteredPets.forEach(pet => {
          const baseId = pet.id.toString().split('-')[0]
          if (!uniquePetsMap.has(baseId)) {
            uniquePetsMap.set(baseId, pet)
          }
        })
        
        // 按名称去重，保留第一个
        const nameMap = new Map()
        const petsAfterIdFilter = Array.from(uniquePetsMap.values())
        petsAfterIdFilter.forEach(pet => {
          const zhName = pet.localized?.zh?.name || pet.name
          if (!nameMap.has(zhName)) {
            nameMap.set(zhName, pet)
          }
        })
        
        const matchedPets = Array.from(nameMap.values())
        
        resultsCount.textContent = `共 ${matchedPets.length} 只精灵`
        
        searchResultsGrid.innerHTML = matchedPets.map(pet => {
          const zhName = pet.localized?.zh?.name || pet.name
          const breeding = pet.breeding
          const heightText = `${breeding.height_low}-${breeding.height_high}cm`
          const weightText = `${(breeding.weight_low / 1000).toFixed(1)}-${(breeding.weight_high / 1000).toFixed(1)}kg`
          const imgPath = getImagePath(pet, 'default')
          
          return `
            <div class="search-result-card" data-id="${pet.id}">
              <img src="${imgPath}" alt="${zhName}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23eee%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2224%22>?</text></svg>'">
              <div class="pet-name">${zhName}</div>
              <div class="pet-info">📏 ${heightText} | ⚖️ ${weightText}</div>
            </div>
          `
        }).join('')
        
        searchResultsGrid.querySelectorAll('.search-result-card').forEach(card => {
          card.addEventListener('click', () => {
            const petId = parseInt(card.dataset.id)
            openPetModal(petId)
          })
        })
      })
      
      resetSearchBtn.addEventListener('click', () => {
        document.getElementById('pet-height').value = ''
        document.getElementById('pet-weight').value = ''
        resultsCount.textContent = '共 0 只精灵'
        searchResultsGrid.innerHTML = ''
      })
    